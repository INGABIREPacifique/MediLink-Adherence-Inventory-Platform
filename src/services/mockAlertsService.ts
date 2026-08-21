import { mockAlerts, mockSummary } from '../data/mockAlerts';
import type { AlertsSummary, AlertStatus, EscalationAlert, FollowUpLogEntry } from '../types';
import type { AlertsService } from './alertsService';

// In-memory store so status changes persist for the session (not just a snapshot).
let alerts: EscalationAlert[] = [...mockAlerts];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAlertsService: AlertsService = {
  async getAlerts() {
    await delay();
    return alerts;
  },

  async getSummary(): Promise<AlertsSummary> {
    await delay();
    const activeCount = alerts.filter((a) => a.status !== 'resolved').length;
    const resolvedToday = alerts.filter((a) => a.status === 'resolved').length;
    return {
      activeCount,
      activeDelta: 3, // mock: change since yesterday
      resolvedToday,
      totalToday: mockSummary.resolvedTotalToday,
    };
  },

  async updateAlertStatus(id: string, status: AlertStatus) {
    await delay(150);
    alerts = alerts.map((a) => (a.id === id ? { ...a, status } : a));
    const updated = alerts.find((a) => a.id === id);
    if (!updated) throw new Error(`Alert ${id} not found`);
    return updated;
  },

  async resolveAlert(id: string, note?: string) {
    await delay(150);
    alerts = alerts.map((a) =>
      a.id === id
        ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toISOString(), resolutionNote: note }
        : a
    );
    const updated = alerts.find((a) => a.id === id);
    if (!updated) throw new Error(`Alert ${id} not found`);
    return updated;
  },

  async logFollowUp(alertId: string, entry: Omit<FollowUpLogEntry, 'id' | 'alertId' | 'loggedAt'>) {
    await delay(150);
    alerts = alerts.map((a) => {
      if (a.id !== alertId) return a;
      const logEntry: FollowUpLogEntry = {
        ...entry,
        id: `log-${a.id}-${(a.followUpLogs?.length ?? 0) + 1}`,
        alertId,
        loggedAt: new Date().toISOString(),
      };
      return {
        ...a,
        status: (a.status === 'pending' ? 'in_progress' : a.status) as AlertStatus,
        followUpLogs: [...(a.followUpLogs ?? []), logEntry],
      };
    });
    const updated = alerts.find((a) => a.id === alertId);
    if (!updated) throw new Error(`Alert ${alertId} not found`);
    return updated;
  },
};
