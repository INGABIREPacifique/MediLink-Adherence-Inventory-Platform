import { supabase } from '../lib/supabaseClient';
import type { PerformanceService } from './performanceService';

// Real Supabase-backed implementation. Honest limitation: the pilot schema
// (0001_init.sql) doesn't yet have a dose-level `dose_reminders` table, so
// there's no ground truth for "doses scheduled vs confirmed" today --
// only escalation-level data exists. adherenceRatePct/followUpsAttendedPct
// below are therefore computed as proxies from escalation resolution rates,
// not true dose confirmation rates. Replace with a real dose_reminders
// table + query once that data model is built (matches the proposal's
// USSD confirmation flow, not yet in this schema).
export const supabasePerformanceService: PerformanceService = {
  async getToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: todayEscalations, error } = await supabase
      .from('escalations')
      .select('status')
      .gte('missed_at', startOfDay.toISOString());
    if (error) throw error;

    const rows = todayEscalations ?? [];
    const resolvedToday = rows.filter((r) => r.status === 'resolved').length;
    const escalationsToday = rows.length;

    // Proxy calculation -- see comment above.
    const adherenceRatePct = escalationsToday === 0 ? 100 : Math.round((resolvedToday / escalationsToday) * 100);
    const followUpsAttendedPct = adherenceRatePct;

    return {
      date: new Date().toISOString().slice(0, 10),
      adherenceRatePct,
      escalationsToday,
      followUpsAttendedPct,
    };
  },
};
