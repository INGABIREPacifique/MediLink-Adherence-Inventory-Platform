import { supabase } from '../lib/supabaseClient';
import type { PerformanceService } from './performanceService';

// Real dose-level implementation, querying `dose_reminders`
// (supabase/migrations/0004_dose_reminders.sql) -- actual scheduled USSD
// dose confirmations for discharged patients monitored from home, not a
// proxy from escalation counts.
export const supabasePerformanceService: PerformanceService = {
  async getToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data: todayDoses, error } = await supabase
      .from('dose_reminders')
      .select('confirmed, scheduled_for')
      .gte('scheduled_for', startOfDay.toISOString())
      .lte('scheduled_for', new Date().toISOString()); // only doses due so far today
    if (error) throw error;

    const rows = todayDoses ?? [];
    const totalScheduled = rows.length;
    const confirmed = rows.filter((r) => r.confirmed).length;
    const missed = totalScheduled - confirmed;
    const adherenceRatePct = totalScheduled === 0 ? 100 : Math.round((confirmed / totalScheduled) * 100);

    const { count: escalationsToday } = await supabase
      .from('escalations')
      .select('*', { count: 'exact', head: true })
      .gte('missed_at', startOfDay.toISOString())
      .lte('missed_at', endOfDay.toISOString());

    return {
      date: new Date().toISOString().slice(0, 10),
      adherenceRatePct,
      escalationsToday: escalationsToday ?? missed,
      followUpsAttendedPct: adherenceRatePct,
    };
  },
};

// Extra real-data query used by DailyPerformanceReport for the 7-day trend
// and the raw today's counts -- not part of the PerformanceService
// interface (which only exposes the summarized DailyPerformance shape),
// so exported separately for that one screen.
export async function getSevenDayAdherenceTrend(): Promise<{ label: string; pct: number }[]> {
  const days: { label: string; pct: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from('dose_reminders')
      .select('confirmed')
      .gte('scheduled_for', start.toISOString())
      .lte('scheduled_for', end.toISOString());

    const rows = data ?? [];
    const pct = rows.length === 0 ? 0 : Math.round((rows.filter((r) => r.confirmed).length / rows.length) * 100);
    days.push({ label: day.toLocaleDateString(undefined, { weekday: 'narrow' }), pct });
  }
  return days;
}

export async function getTodayDoseCounts(): Promise<{ totalScheduled: number; confirmed: number; missed: number }> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from('dose_reminders')
    .select('confirmed')
    .gte('scheduled_for', startOfDay.toISOString())
    .lte('scheduled_for', new Date().toISOString());
  const rows = data ?? [];
  const confirmed = rows.filter((r) => r.confirmed).length;
  return { totalScheduled: rows.length, confirmed, missed: rows.length - confirmed };
}
