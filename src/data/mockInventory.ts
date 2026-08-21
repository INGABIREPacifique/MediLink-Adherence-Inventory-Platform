import type { InventoryItem } from '../types';

const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();

export const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1', name: 'Amoxicillin 500mg', form: 'Capsule, Blister Pack', unit: 'Boxes',
    currentStock: 12, reorderThreshold: 30, status: 'critical',
    expiresOn: daysFromNow(210), lastLoggedAt: new Date().toISOString(),
  },
  {
    id: 'inv-2', name: 'Paracetamol 500mg', form: 'Tablet, Bottle', unit: 'Bottles',
    currentStock: 45, reorderThreshold: 40, status: 'warning',
    expiresOn: daysFromNow(45), lastLoggedAt: new Date().toISOString(),
  },
  {
    id: 'inv-3', name: 'Rifampicin/Isoniazid', form: 'Tablet, Blister Pack', unit: 'Boxes',
    currentStock: 120, reorderThreshold: 30, status: 'healthy',
    expiresOn: daysFromNow(300), lastLoggedAt: new Date().toISOString(),
  },
  {
    id: 'inv-4', name: 'Ethambutol', form: 'Tablet, Bottle', unit: 'Bottles',
    currentStock: 60, reorderThreshold: 25, status: 'healthy',
    expiresOn: daysFromNow(180), lastLoggedAt: new Date().toISOString(),
  },
  {
    id: 'inv-5', name: 'Ceftriaxone 1g', form: 'Vial for Injection', unit: 'Vials',
    currentStock: 8, reorderThreshold: 15, status: 'critical',
    expiresOn: daysFromNow(90), lastLoggedAt: new Date().toISOString(),
  },
];
