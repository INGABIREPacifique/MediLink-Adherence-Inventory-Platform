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
  // AI-assisted priority ranking — proposal §4: AI ranks which non-responders
  // need urgent follow-up first (condition risk, dosage type, history).
  // The trigger itself stays rule-based; only this ranking is AI-assisted.
  aiPriority?: 'low' | 'medium' | 'high' | 'critical';
  aiReasoning?: string; // one-sentence, shown directly in the inbox
  followUpLogs?: FollowUpLogEntry[];
}

export interface FollowUpLogEntry {
  id: string;
  alertId: string;
  loggedBy: string; // nurse name
  method: 'phone' | 'in_person' | 'sms';
  outcome: 'confirmed_taken' | 'confirmed_missed' | 'unreachable' | 'rescheduled';
  notes: string;
  loggedAt: string; // ISO timestamp
}

export interface AlertsSummary {
  activeCount: number;
  activeDelta: number; // change since yesterday, e.g. +3
  resolvedToday: number;
  totalToday: number;
}

// ---------- Ward Inventory ----------

export type StockStatus = 'healthy' | 'adequate' | 'warning' | 'critical';

export interface InventoryItem {
  id: string;
  name: string;
  form: string; // e.g. "Capsule, Blister Pack"
  unit: string; // e.g. "Boxes", "Vials"
  currentStock: number;
  reorderThreshold: number; // rule-based baseline, per proposal §4
  status: StockStatus;
  expiresOn?: string; // ISO date
  lastLoggedAt: string;
}

export interface InventorySummary {
  totalItems: number;
  criticalCount: number;
  expiringSoonCount: number; // < 90 days
}

// ---------- Staff Registration (patient enrollment at discharge) ----------

export interface PrescriptionSchedule {
  medication: string;
  dosage: string;
  timesPerDay: number;
  scheduleTimes: string[]; // e.g. ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
}

export interface EnrollmentDraft {
  patientName: string;
  phone: string;
  preferredChannel: 'ussd' | 'ivr' | 'sms';
  language: 'rw' | 'en' | 'fr';
  medications: PrescriptionSchedule[]; // most discharged patients take more than one -- each tracked and confirmed separately
  nextFollowUpDate: string;
}

// ---------- Escalation Rules Configuration ----------

export interface EscalationRules {
  facilityId: string;
  missedDoseWindowMinutes: number; // default 240 (4h), per pilot doc
  secondReminderDelayMinutes: number; // default 60
  consecutiveMissesEnabled: boolean;
  consecutiveMissesThreshold: number;
  updatedBy: string;
  updatedAt: string;
}

// ---------- Nurse Daily Handover ----------

export interface ShiftHandover {
  id: string;
  outgoingNurse: string;
  incomingNurse: string;
  pendingEscalationsCount: number;
  lowStockItemsCount: number;
  notes: string;
  acknowledged: boolean;
  createdAt: string;
}

// ---------- Daily Performance Report ----------

export interface DailyPerformance {
  date: string; // ISO date
  adherenceRatePct: number; // confirmed doses / scheduled doses
  escalationsToday: number;
  followUpsAttendedPct: number;
}

// ---------- Patient Discharge Summary ----------

export interface DischargeSummary {
  patient: Patient;
  monitoringPeriodStart: string;
  monitoringPeriodEnd: string;
  adherenceRatePct: number;
  totalEscalations: number;
  followUpsAttended: number;
  followUpsScheduled: number;
  notes: string;
}
