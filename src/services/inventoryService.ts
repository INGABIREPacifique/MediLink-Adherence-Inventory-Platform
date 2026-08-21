import type { InventoryItem, InventorySummary } from '../types';

export interface InventoryService {
  getItems(): Promise<InventoryItem[]>;
  getSummary(): Promise<InventorySummary>;
  logUsage(id: string, delta: number): Promise<InventoryItem>;
}
