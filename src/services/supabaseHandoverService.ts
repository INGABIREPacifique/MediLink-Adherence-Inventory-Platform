import { supabase } from '../lib/supabaseClient';
import type { ShiftHandover } from '../types';
import type { HandoverService } from './handoverService';

interface HandoverRow {
  id: string;
  outgoing_nurse: string;
  incoming_nurse: string;
  pending_escalations_count: number;
  low_stock_items_count: number;
  notes: string | null;
  acknowledged: boolean;
  created_at: string;
}

function mapRow(row: HandoverRow): ShiftHandover {
  return {
    id: row.id,
    outgoingNurse: row.outgoing_nurse,
    incomingNurse: row.incoming_nurse,
    pendingEscalationsCount: row.pending_escalations_count,
    lowStockItemsCount: row.low_stock_items_count,
    notes: row.notes ?? '',
    acknowledged: row.acknowledged,
    createdAt: row.created_at,
  };
}

export const supabaseHandoverService: HandoverService = {
  async getPendingSnapshot() {
    // Live counts pulled from the real escalations/inventory tables --
    // this is what actually populates the "Unresolved Escalations" /
    // "Critical Stock" panels on the Shift Handover screen.
    const [{ count: pendingEscalationsCount }, { count: lowStockItemsCount }] = await Promise.all([
      supabase.from('escalations').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']),
      supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('status', 'critical'),
    ]);
    return {
      pendingEscalationsCount: pendingEscalationsCount ?? 0,
      lowStockItemsCount: lowStockItemsCount ?? 0,
    };
  },

  async submitHandover(notes, outgoingNurse, incomingNurse) {
    const snapshot = await this.getPendingSnapshot();
    const { data, error } = await supabase
      .from('shift_handovers')
      .insert({
        outgoing_nurse: outgoingNurse,
        incoming_nurse: incomingNurse,
        pending_escalations_count: snapshot.pendingEscalationsCount,
        low_stock_items_count: snapshot.lowStockItemsCount,
        notes,
        acknowledged: true,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data as HandoverRow);
  },

  async getRecentHandovers() {
    const { data, error } = await supabase
      .from('shift_handovers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return ((data ?? []) as HandoverRow[]).map(mapRow);
  },
};
