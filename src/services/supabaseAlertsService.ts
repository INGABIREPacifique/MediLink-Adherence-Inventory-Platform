import { supabase } from '../lib/supabaseClient';
import type { AlertsSummary, AlertStatus, EscalationAlert, FollowUpLogEntry } from '../types';
import type { AlertsService } from './alertsService';

// Real Supabase-backed implementation of AlertsService, querying the
// `escalations` / `patients` / `follow_up_logs` tables from
// supabase/migrations/0001_init.sql. Row shape is snake_case in Postgres,
// mapped to the camelCase EscalationAlert type here at the edge.

interface EscalationRow {
  id: string;
  medication: string;
  phase: string | null;
  missed_at: string;
  status: AlertStatus;
  resolved_at: string | null;
  resolution_note: string | null;
  ai_priority: EscalationAlert['aiPriority'] | null;
  ai_reasoning: string | null;
  patients: { id: string; name: string; phone: string } | null;
  follow_up_logs: {
    id: string;
    logged_by: string;
    method: FollowUpLogEntry['method'];
    outcome: FollowUpLogEntry['outcome'];
    notes: string | null;
    logged_at: string;
  }[];
}

function mapRow(row: EscalationRow): EscalationAlert {
  return {
    id: row.id,
    patient: { id: row.patients?.id ?? '', name: row.patients?.name ?? 'Unknown patient', phone: row.patients?.phone ?? '' },
    medication: row.medication,
    phase: row.phase ?? '',
    missedAt: row.missed_at,
    status: row.status,
    resolvedAt: row.resolved_at ?? undefined,
    resolutionNote: row.resolution_note ?? undefined,
    aiPriority: row.ai_priority ?? undefined,
    aiReasoning: row.ai_reasoning ?? undefined,
    followUpLogs: (row.follow_up_logs ?? []).map((l) => ({
      id: l.id,
      alertId: row.id,
      loggedBy: l.logged_by,
      method: l.method,
      outcome: l.outcome,
      notes: l.notes ?? '',
      loggedAt: l.logged_at,
    })),
  };
}

const SELECT = `
  id, medication, phase, missed_at, status, resolved_at, resolution_note, ai_priority, ai_reasoning,
  patients:patient_id ( id, name, phone ),
  follow_up_logs ( id, logged_by, method, outcome, notes, logged_at )
`;

export const supabaseAlertsService: AlertsService = {
  async getAlerts() {
    const { data, error } = await supabase
      .from('escalations')
      .select(SELECT)
      .order('missed_at', { ascending: true });
    if (error) throw error;
    return ((data ?? []) as unknown as EscalationRow[]).map(mapRow);
  },

  async getSummary(): Promise<AlertsSummary> {
    const { data, error } = await supabase.from('escalations').select('status');
    if (error) throw error;
    const rows = data ?? [];
    const activeCount = rows.filter((r) => r.status !== 'resolved').length;
    const resolvedToday = rows.filter((r) => r.status === 'resolved').length;
    return { activeCount, activeDelta: 0, resolvedToday, totalToday: rows.length };
  },

  async updateAlertStatus(id: string, status: AlertStatus) {
    const { data, error } = await supabase
      .from('escalations')
      .update({ status })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error) throw error;
    return mapRow(data as unknown as EscalationRow);
  },

  async resolveAlert(id: string, note?: string) {
    const { data, error } = await supabase
      .from('escalations')
      .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolution_note: note })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error) throw error;
    return mapRow(data as unknown as EscalationRow);
  },

  async logFollowUp(alertId: string, entry: Omit<FollowUpLogEntry, 'id' | 'alertId' | 'loggedAt'>) {
    const { error: insertError } = await supabase.from('follow_up_logs').insert({
      escalation_id: alertId,
      logged_by: entry.loggedBy,
      method: entry.method,
      outcome: entry.outcome,
      notes: entry.notes,
    });
    if (insertError) throw insertError;

    // Logging a follow-up moves a pending alert to in_progress -- mirrors the
    // mock service's behavior, so swapping the export doesn't change UX.
    await supabase.from('escalations').update({ status: 'in_progress' }).eq('id', alertId).eq('status', 'pending');

    const { data, error } = await supabase.from('escalations').select(SELECT).eq('id', alertId).single();
    if (error) throw error;
    return mapRow(data as unknown as EscalationRow);
  },
};
