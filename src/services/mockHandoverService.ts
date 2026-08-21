import type { ShiftHandover } from '../types';
import type { HandoverService } from './handoverService';

let handovers: ShiftHandover[] = [
  {
    id: 'ho-1', outgoingNurse: 'Nurse Uwase', incomingNurse: 'Nurse Habimana',
    pendingEscalationsCount: 2, lowStockItemsCount: 2, notes: 'Bed 4 patient due for follow-up call at 18:00.',
    acknowledged: true, createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockHandoverService: HandoverService = {
  async getPendingSnapshot() {
    await delay();
    return { pendingEscalationsCount: 3, lowStockItemsCount: 2 };
  },
  async submitHandover(notes, outgoingNurse, incomingNurse) {
    await delay(150);
    const snapshot = await this.getPendingSnapshot();
    const record: ShiftHandover = {
      id: `ho-${handovers.length + 1}`,
      outgoingNurse, incomingNurse,
      pendingEscalationsCount: snapshot.pendingEscalationsCount,
      lowStockItemsCount: snapshot.lowStockItemsCount,
      notes, acknowledged: true, createdAt: new Date().toISOString(),
    };
    handovers = [record, ...handovers];
    return record;
  },
  async getRecentHandovers() {
    await delay();
    return handovers;
  },
};
