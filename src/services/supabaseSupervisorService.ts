import { supabase } from '../lib/supabaseClient';

export interface SupervisorOverview {
  totalActiveChws: number;
  patientAdherencePct: number;
  avgResponseHours: number;
  pendingVisits: number;
}

export interface ChwRosterRow {
  id: string;
  name: string;
  assignedPatients: number;
  visitsLogged: number;
  openEscalations: number;
  status: 'excellent' | 'good' | 'review' | 'critical';
}

// Matches Figma "CHW Supervisor Dashboard" content -- KPI row + CHW
// Performance Roster. The Regional Adherence Heatmap in the Figma design
// is intentionally NOT built: this pilot has no facility geolocation data
// in the schema, and fabricating map coordinates would be worse than
// leaving it out.
export async function getSupervisorOverview(): Promise<SupervisorOverview> {
  const { count: totalActiveChws } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'chw');

  const { data: doses } = await supabase.from('dose_reminders').select('confirmed').lte('scheduled_for', new Date().toISOString());
  const doseRows = doses ?? [];
  const patientAdherencePct = doseRows.length === 0 ? 0 : Math.round((doseRows.filter((d) => d.confirmed).length / doseRows.length) * 100);

  const { data: resolved } = await supabase
    .from('escalations')
    .select('missed_at, resolved_at')
    .eq('status', 'resolved')
    .not('resolved_at', 'is', null);
  const resolvedRows = resolved ?? [];
  const avgResponseHours = resolvedRows.length === 0 ? 0 : Math.round(
    (resolvedRows.reduce((sum, r) => sum + (new Date(r.resolved_at!).getTime() - new Date(r.missed_at).getTime()), 0) /
      resolvedRows.length / (1000 * 60 * 60)) * 10
  ) / 10;

  const { count: pendingVisits } = await supabase
    .from('escalations')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'resolved');

  return {
    totalActiveChws: totalActiveChws ?? 0,
    patientAdherencePct,
    avgResponseHours,
    pendingVisits: pendingVisits ?? 0,
  };
}

export async function getChwRoster(): Promise<ChwRosterRow[]> {
  const { data: chws, error } = await supabase.from('profiles').select('id, full_name').eq('role', 'chw');
  if (error) throw error;

  return Promise.all(
    (chws ?? []).map(async (chw) => {
      const { count: assignedPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_chw_id', chw.id);

      const { count: visitsLogged } = await supabase
        .from('chw_visits')
        .select('*', { count: 'exact', head: true })
        .eq('logged_by', chw.id);

      const { data: assignedPatientIds } = await supabase.from('patients').select('id').eq('assigned_chw_id', chw.id);
      const ids = (assignedPatientIds ?? []).map((p) => p.id);
      let openEscalations = 0;
      if (ids.length > 0) {
        const { count } = await supabase
          .from('escalations')
          .select('*', { count: 'exact', head: true })
          .in('patient_id', ids)
          .neq('status', 'resolved');
        openEscalations = count ?? 0;
      }

      const status: ChwRosterRow['status'] =
        openEscalations >= 4 ? 'critical' : openEscalations >= 2 ? 'review' : (visitsLogged ?? 0) > 0 ? 'excellent' : 'good';

      return {
        id: chw.id,
        name: chw.full_name,
        assignedPatients: assignedPatients ?? 0,
        visitsLogged: visitsLogged ?? 0,
        openEscalations,
        status,
      };
    })
  );
}
