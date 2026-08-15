export type AlertStatus = 'pending' | 'in_progress' | 'resolved';

export interface Patient {
  id: string;
  name: string;
  phone: string;
}

export interface EscalationAlert {
  id: string;
  patient: Patient;
  medication: string;
  phase: string; // e.g. "Phase 1 (Intensive)"
  missedAt: string; // ISO timestamp of the missed dose
  status: AlertStatus;
  resolvedAt?: string; // ISO timestamp, only when resolved
  resolutionNote?: string;
}

export interface AlertsSummary {
  activeCount: number;
  activeDelta: number; // change since yesterday, e.g. +3
  resolvedToday: number;
  totalToday: number;
}
