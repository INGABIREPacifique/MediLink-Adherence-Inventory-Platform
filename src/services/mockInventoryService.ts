import { mockInventory } from '../data/mockInventory';
import type { InventoryItem, InventorySummary } from '../types';
import type { InventoryService } from './inventoryService';

let items: InventoryItem[] = [...mockInventory];
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function recompute(item: InventoryItem): InventoryItem {
  const status =
    item.currentStock <= item.reorderThreshold * 0.5 ? 'critical' :
    item.currentStock <= item.reorderThreshold ? 'warning' :
    item.currentStock <= item.reorderThreshold * 1.5 ? 'adequate' : 'healthy';
  return { ...item, status };
}

export const mockInventoryService: InventoryService = {
  async getItems() {
    await delay();
    return items;
  },

  async getSummary(): Promise<InventorySummary> {
    await delay();
    const expiringSoon = items.filter((i) => {
      if (!i.expiresOn) return false;
      const days = (new Date(i.expiresOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days <= 90;
    });
    return {
      totalItems: items.length,
      criticalCount: items.filter((i) => i.status === 'critical').length,
      expiringSoonCount: expiringSoon.length,
    };
  },

  async logUsage(id: string, delta: number) {
    await delay(150);
    items = items.map((i) =>
      i.id === id ? recompute({ ...i, currentStock: Math.max(0, i.currentStock + delta), lastLoggedAt: new Date().toISOString() }) : i
    );
    const updated = items.find((i) => i.id === id);
    if (!updated) throw new Error(`Item ${id} not found`);
    return updated;
  },
};
