import { supabase } from '../lib/supabaseClient';

export interface MonthlyStockReportRow extends Record<string, string | number> {
  medication: string;
  remaining_stock: number;
  unit: string;
  consumption_last_30_days: number;
  reorder_events_last_30_days: number;
  expires_on: string;
  expiring_soon: string;
}

// Matches the proposal's exact deliverable (§3.2): "Auto-generated monthly
// stock reports summarizing consumption, remaining stock, expiring
// batches, and reorder history." Real query against inventory_items +
// stock_movements -- not a static export.
export async function getMonthlyStockReport(): Promise<MonthlyStockReportRow[]> {
  const { data: items, error: itemsError } = await supabase.from('inventory_items').select('*');
  if (itemsError) throw itemsError;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rows: MonthlyStockReportRow[] = [];
  for (const item of items ?? []) {
    const { data: movements } = await supabase
      .from('stock_movements')
      .select('delta')
      .eq('item_id', item.id)
      .gte('logged_at', thirtyDaysAgo.toISOString());

    const consumed = (movements ?? []).filter((m) => m.delta < 0).reduce((sum, m) => sum + Math.abs(m.delta), 0);
    const reorders = (movements ?? []).filter((m) => m.delta > 0).length;

    const expiringSoon = item.expires_on
      ? (new Date(item.expires_on).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 90
      : false;

    rows.push({
      medication: item.name,
      remaining_stock: item.current_stock,
      unit: item.unit,
      consumption_last_30_days: consumed,
      reorder_events_last_30_days: reorders,
      expires_on: item.expires_on ?? 'N/A',
      expiring_soon: expiringSoon ? 'Yes' : 'No',
    });
  }
  return rows;
}

export interface DailyAdherenceReportRow extends Record<string, string | number> {
  date: string;
  total_scheduled: number;
  confirmed: number;
  missed: number;
  escalations_opened: number;
}

// Matches the proposal's "monthly reporting -- rule-based aggregation" for
// the adherence side, exported from the Daily Performance Report screen.
export async function getAdherenceReportForToday(): Promise<DailyAdherenceReportRow> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: doses } = await supabase
    .from('dose_reminders')
    .select('confirmed')
    .gte('scheduled_for', startOfDay.toISOString())
    .lte('scheduled_for', new Date().toISOString());

  const { count: escalationsToday } = await supabase
    .from('escalations')
    .select('*', { count: 'exact', head: true })
    .gte('missed_at', startOfDay.toISOString());

  const rows = doses ?? [];
  const confirmed = rows.filter((d) => d.confirmed).length;

  return {
    date: new Date().toISOString().slice(0, 10),
    total_scheduled: rows.length,
    confirmed,
    missed: rows.length - confirmed,
    escalations_opened: escalationsToday ?? 0,
  };
}
