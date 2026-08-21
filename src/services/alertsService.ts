import type { AlertsSummary, AlertStatus, EscalationAlert, FollowUpLogEntry } from '../types';

export interface AlertsService {
  getAlerts(): Promise<EscalationAlert[]>;
  getSummary(): Promise<AlertsSummary>;
  updateAlertStatus(id: string, status: AlertStatus): Promise<EscalationAlert>;
  resolveAlert(id: string, note?: string): Promise<EscalationAlert>;
  logFollowUp(alertId: string, entry: Omit<FollowUpLogEntry, 'id' | 'alertId' | 'loggedAt'>): Promise<EscalationAlert>;
}
