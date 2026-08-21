import type { ShiftHandover } from '../types';

export interface HandoverService {
  getPendingSnapshot(): Promise<{ pendingEscalationsCount: number; lowStockItemsCount: number }>;
  submitHandover(notes: string, outgoingNurse: string, incomingNurse: string): Promise<ShiftHandover>;
  getRecentHandovers(): Promise<ShiftHandover[]>;
}
