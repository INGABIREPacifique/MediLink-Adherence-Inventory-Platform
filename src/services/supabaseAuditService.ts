import { supabase } from '../lib/supabaseClient';

export interface AuditEntry {
  id: string;
  type: 'follow_up' | 'visit';
  patientName: string;
  actor: string;
  summary: string;
  at: string;
}

// A real combined audit trail from data that already exists -- follow-up
// logs (nurse actions on escalations) and CHW visits. Backs the "Audit
// Log" button on Escalation Rules Config, which previously did nothing.
export async function getAuditLog(): Promise<AuditEntry[]> {
  const [{ data: followUps }, { data: visits }] = await Promise.all([
    supabase
      .from('follow_up_logs')
      .select('id, logged_by, method, outcome, notes, logged_at, escalations:escalation_id ( patients:patient_id ( name ) )')
      .order('logged_at', { ascending: false })
      .limit(25),
    supabase
      .from('chw_visits')
      .select('id, outcome, notes, visited_at, patients:patient_id ( name ), profiles:logged_by ( full_name )')
      .order('visited_at', { ascending: false })
      .limit(25),
  ]);

  const followUpEntries: AuditEntry[] = ((followUps ?? []) as unknown as {
    id: string; logged_by: string; method: string; outcome: string; notes: string | null; logged_at: string;
    escalations: { patients: { name: string } | null } | null;
  }[]).map((f) => ({
    id: `fu-${f.id}`,
    type: 'follow_up',
    patientName: f.escalations?.patients?.name ?? 'Unknown patient',
    actor: f.logged_by,
    summary: `Follow-up via ${f.method} -- ${f.outcome.replace(/_/g, ' ')}${f.notes ? `: ${f.notes}` : ''}`,
    at: f.logged_at,
  }));

  const visitEntries: AuditEntry[] = ((visits ?? []) as unknown as {
    id: string; outcome: string; notes: string | null; visited_at: string;
    patients: { name: string } | null; profiles: { full_name: string } | null;
  }[]).map((v) => ({
    id: `visit-${v.id}`,
    type: 'visit',
    patientName: v.patients?.name ?? 'Unknown patient',
    actor: v.profiles?.full_name ?? 'Unknown staff',
    summary: `Home visit -- ${v.outcome}${v.notes ? `: ${v.notes}` : ''}`,
    at: v.visited_at,
  }));

  return [...followUpEntries, ...visitEntries].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
