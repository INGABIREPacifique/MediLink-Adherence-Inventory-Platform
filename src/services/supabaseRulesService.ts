import { supabase } from '../lib/supabaseClient';
import type { EscalationRules } from '../types';
import type { RulesService } from './rulesService';

// Real Supabase-backed implementation, querying the single-row
// `escalation_rules` table seeded in 0001_init.sql (missed_dose_window_minutes
// defaults to 240 = 4h, per pilot protocol).

interface RulesRow {
  id: string;
  missed_dose_window_minutes: number;
  second_reminder_delay_minutes: number;
  updated_by: string | null;
  updated_at: string;
}

function mapRow(row: RulesRow): EscalationRules {
  return {
    facilityId: 'kigali-central-internal-medicine', // single-facility pilot, not yet a real FK
    missedDoseWindowMinutes: row.missed_dose_window_minutes,
    secondReminderDelayMinutes: row.second_reminder_delay_minutes,
    updatedBy: row.updated_by ?? 'System Default',
    updatedAt: row.updated_at,
  };
}

export const supabaseRulesService: RulesService = {
  async getRules() {
    const { data, error } = await supabase.from('escalation_rules').select('*').limit(1).single();
    if (error) throw error;
    return mapRow(data as RulesRow);
  },

  async updateRules(update) {
    // Single-row table for the pilot -- fetch its id, then update in place.
    const { data: existing, error: fetchError } = await supabase.from('escalation_rules').select('id').limit(1).single();
    if (fetchError) throw fetchError;

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (update.missedDoseWindowMinutes !== undefined) patch.missed_dose_window_minutes = update.missedDoseWindowMinutes;
    if (update.secondReminderDelayMinutes !== undefined) patch.second_reminder_delay_minutes = update.secondReminderDelayMinutes;

    const { data, error } = await supabase
      .from('escalation_rules')
      .update(patch)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data as RulesRow);
  },
};
