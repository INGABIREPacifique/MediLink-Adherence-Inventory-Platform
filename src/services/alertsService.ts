import type { AlertsSummary, AlertStatus, EscalationAlert } from '../types';

export interface AlertsService {
  getAlerts(): Promise<EscalationAlert[]>;
  getSummary(): Promise<AlertsSummary>;
  updateAlertStatus(id: string, status: AlertStatus): Promise<EscalationAlert>;
  resolveAlert(id: string, note?: string): Promise<EscalationAlert>;
}
