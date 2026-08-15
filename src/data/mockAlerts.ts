import type { EscalationAlert } from '../types';

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const mockAlerts: EscalationAlert[] = [
  {
    id: 'alert-1',
    patient: { id: 'p-1', name: 'Jean-Baptiste Mugisha', phone: '+250 788 123 456' },
    medication: 'Rifampicin/Isoniazid',
    phase: 'Phase 1 (Intensive)',
    missedAt: hoursAgo(6.75),
    status: 'pending',
  },
  {
    id: 'alert-2',
    patient: { id: 'p-2', name: 'Aline Uwimana', phone: '+250 782 987 654' },
    medication: 'Ethambutol',
    phase: 'Phase 2 (Continuation)',
    missedAt: hoursAgo(4.33),
    status: 'in_progress',
  },
  {
    id: 'alert-3',
    patient: { id: 'p-3', name: 'Emmanuel Nsengiyumva', phone: '+250 783 444 555' },
    medication: 'Pyrazinamide',
    phase: 'Phase 1 (Intensive)',
    missedAt: hoursAgo(5.17),
    status: 'pending',
  },
  {
    id: 'alert-4',
    patient: { id: 'p-4', name: 'Chantal Iribagiza', phone: '+250 781 222 333' },
    medication: 'Rifampicin',
    phase: 'Phase 1 (Intensive)',
    missedAt: hoursAgo(9),
    status: 'resolved',
    resolvedAt: (() => {
      const d = new Date();
      d.setHours(14, 30, 0, 0);
      return d.toISOString();
    })(),
    resolutionNote: 'Reached by phone, confirmed dose taken late.',
  },
];

export const mockSummary = {
  resolvedTotalToday: 59,
};
