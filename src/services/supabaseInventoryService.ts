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

// Status thresholds are now computed inside the atomic log_stock_usage()
// Postgres function (0014_strengthen_logic.sql) -- kept only server-side
// so the increment and status recompute happen in one transaction.

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
    // Was a client-side read-then-write (fetch current_stock, compute new
    // value, write it back) -- two people logging stock at the same
    // moment could race and one update would silently overwrite the
    // other. Now a single atomic Postgres function
    // (0014_strengthen_logic.sql) does the increment, status recompute,
    // and stock_movements insert all in one transaction -- no race window.
    const { data, error } = await supabase.rpc('log_stock_usage', { p_item_id: id, p_delta: delta });
    if (error) throw error;
    return mapRow(data as InventoryRow);
  },
};
