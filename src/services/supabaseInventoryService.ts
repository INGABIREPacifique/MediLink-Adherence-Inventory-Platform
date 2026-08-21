import { supabase } from '../lib/supabaseClient';
import type { InventoryItem, InventorySummary, StockStatus } from '../types';
import type { InventoryService } from './inventoryService';

// Real Supabase-backed implementation of InventoryService, querying
// `inventory_items` / `stock_movements` from supabase/migrations/0001_init.sql.

interface InventoryRow {
  id: string;
  name: string;
  form: string | null;
  unit: string;
  current_stock: number;
  reorder_threshold: number;
  status: StockStatus;
  expires_on: string | null;
  last_logged_at: string;
}

function mapRow(row: InventoryRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    form: row.form ?? '',
    unit: row.unit,
    currentStock: row.current_stock,
    reorderThreshold: row.reorder_threshold,
    status: row.status,
    expiresOn: row.expires_on ?? undefined,
    lastLoggedAt: row.last_logged_at,
  };
}

// Rule-based status recompute -- mirrors mockInventoryService so behavior is
// identical either way. Written client-side here; move to a Postgres
// trigger/function if multiple clients ever write concurrently.
function computeStatus(currentStock: number, threshold: number): StockStatus {
  if (currentStock <= threshold * 0.5) return 'critical';
  if (currentStock <= threshold) return 'warning';
  if (currentStock <= threshold * 1.5) return 'adequate';
  return 'healthy';
}

export const supabaseInventoryService: InventoryService = {
  async getItems() {
    const { data, error } = await supabase.from('inventory_items').select('*').order('name');
    if (error) throw error;
    return ((data ?? []) as InventoryRow[]).map(mapRow);
  },

  async getSummary(): Promise<InventorySummary> {
    const { data, error } = await supabase.from('inventory_items').select('status, expires_on');
    if (error) throw error;
    const rows = data ?? [];
    const expiringSoon = rows.filter((r) => {
      if (!r.expires_on) return false;
      const days = (new Date(r.expires_on).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days <= 90;
    });
    return {
      totalItems: rows.length,
      criticalCount: rows.filter((r) => r.status === 'critical').length,
      expiringSoonCount: expiringSoon.length,
    };
  },

  async logUsage(id: string, delta: number) {
    const { data: current, error: fetchError } = await supabase
      .from('inventory_items')
      .select('current_stock, reorder_threshold')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const newStock = Math.max(0, current.current_stock + delta);
    const newStatus = computeStatus(newStock, current.reorder_threshold);

    const { data, error } = await supabase
      .from('inventory_items')
      .update({ current_stock: newStock, status: newStatus, last_logged_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    await supabase.from('stock_movements').insert({ item_id: id, delta });

    return mapRow(data as InventoryRow);
  },
};
