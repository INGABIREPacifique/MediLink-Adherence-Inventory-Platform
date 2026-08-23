import { supabase } from '../lib/supabaseClient';
import type { EscalationAlert } from '../types';

export interface ChwOverview {
  urgentVisitsCount: number;
  followUpsTodayCount: number;
  totalPatientsCount: number;
}

export interface ChwPatient {
  id: string;
  name: string;
  phone: string;
  enrolledAt: string;
}

export interface ChwVisit {
  id: string;
  patientId: string;
  patientName: string;
  outcome: 'visited' | 'unreachable' | 'rescheduled';
  notes: string;
  visitedAt: string;
  loggedByName: string;
}

// Backs the CHW role's Home/Patients/Visit Log screens -- real Supabase
// queries, same tables the nurse dashboard uses (escalations, patients,
// appointments), no separate "CHW data" that could drift from the truth.
// Patients are scoped per-CHW via patients.assigned_chw_id (unassigned
// patients remain visible to any CHW -- see getChwPatients below).

export async function getChwOverview(): Promise<ChwOverview> {
  const [{ count: urgentVisitsCount }, { count: followUpsTodayCount }, { count: totalPatientsCount }] =
    await Promise.all([
      supabase.from('escalations').select('*', { count: 'exact', head: true }).in('ai_priority', ['high', 'critical']).neq('status', 'resolved'),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'scheduled').eq('scheduled_for', new Date().toISOString().slice(0, 10)),
      supabase.from('patients').select('*', { count: 'exact', head: true }),
    ]);
  return {
    urgentVisitsCount: urgentVisitsCount ?? 0,
    followUpsTodayCount: followUpsTodayCount ?? 0,
    totalPatientsCount: totalPatientsCount ?? 0,
  };
}

export async function getPriorityTasks(): Promise<EscalationAlert[]> {
  const { data, error } = await supabase
    .from('escalations')
    .select(`
      id, medication, phase, missed_at, status, resolved_at, resolution_note, ai_priority, ai_reasoning,
      patients:patient_id ( id, name, phone )
    `)
    .neq('status', 'resolved')
    .order('missed_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as {
    id: string; medication: string; phase: string | null; missed_at: string; status: EscalationAlert['status'];
    resolved_at: string | null; resolution_note: string | null; ai_priority: EscalationAlert['aiPriority']; ai_reasoning: string | null;
    patients: { id: string; name: string; phone: string } | null;
  }[]).map((r) => ({
    id: r.id,
    patient: { id: r.patients?.id ?? '', name: r.patients?.name ?? 'Unknown', phone: r.patients?.phone ?? '' },
    medication: r.medication,
    phase: r.phase ?? '',
    missedAt: r.missed_at,
    status: r.status,
    resolvedAt: r.resolved_at ?? undefined,
    resolutionNote: r.resolution_note ?? undefined,
    aiPriority: r.ai_priority ?? undefined,
    aiReasoning: r.ai_reasoning ?? undefined,
  }));
}

export async function getChwPatients(): Promise<ChwPatient[]> {
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id;

  // Shows patients assigned to this CHW, plus any unassigned patients
  // (assigned_chw_id is null) -- so a single-CHW pilot still sees
  // everyone, but once a second CHW is added, assigned patients stay
  // scoped to the right person instead of showing to both.
  const { data, error } = await supabase
    .from('patients')
    .select('id, name, phone, enrolled_at')
    .or(`assigned_chw_id.is.null,assigned_chw_id.eq.${currentUserId}`)
    .order('name');
  if (error) throw error;
  return (data ?? []).map((p) => ({ id: p.id, name: p.name, phone: p.phone, enrolledAt: p.enrolled_at }));
}

export async function getChwVisits(): Promise<ChwVisit[]> {
  const { data, error } = await supabase
    .from('chw_visits')
    .select('id, patient_id, outcome, notes, visited_at, patients:patient_id ( name ), profiles:logged_by ( full_name )')
    .order('visited_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return ((data ?? []) as unknown as { id: string; patient_id: string; outcome: ChwVisit['outcome']; notes: string | null; visited_at: string; patients: { name: string } | null; profiles: { full_name: string } | null }[]).map((r) => ({
    id: r.id,
    patientId: r.patient_id,
    patientName: r.patients?.name ?? 'Unknown',
    outcome: r.outcome,
    notes: r.notes ?? '',
    visitedAt: r.visited_at,
    loggedByName: r.profiles?.full_name ?? 'Unknown staff',
  }));
}

export async function logChwVisit(patientId: string, outcome: ChwVisit['outcome'], notes: string, escalationId?: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('chw_visits').insert({
    patient_id: patientId,
    escalation_id: escalationId ?? null,
    outcome,
    notes,
    logged_by: userData.user?.id ?? null, // was never set before -- every visit was anonymous
  });
  if (error) throw error;
}
