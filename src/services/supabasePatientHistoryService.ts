import { supabase } from '../lib/supabaseClient';

export interface PatientSummary {
  id: string;
  name: string;
  phone: string;
  adherenceRatePct: number;
  dosesTaken: number;
  dosesMissed: number;
}

export type DayStatus = 'taken' | 'missed' | 'pending' | 'none';

export interface DoseHistoryRow {
  id: string;
  scheduledFor: string;
  medication: string;
  status: 'taken' | 'missed' | 'late' | 'pending';
}

export interface PatientHistory {
  patient: PatientSummary;
  weekStatus: { day: string; status: DayStatus }[]; // Monday -> Sunday, this week
  recentDoses: DoseHistoryRow[];
}

// Matches Figma node 1:7697 "Patient Adherence History" -- real per-patient
// view a nurse or CHW opens to see exactly which days a patient took or
// missed which medication. Multiple medications are handled naturally:
// each dose confirmation (per prescription, per scheduled time) is its own
// row, so a patient on 2 medications shows 2 rows per day, not one
// conflated status.
export async function getPatientHistory(patientId: string): Promise<PatientHistory> {
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id, name, phone')
    .eq('id', patientId)
    .single();
  if (patientError || !patient) throw patientError ?? new Error('Patient not found');

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('id, medication')
    .eq('patient_id', patientId);

  const prescriptionIds = (prescriptions ?? []).map((p) => p.id);
  const medicationById = new Map((prescriptions ?? []).map((p) => [p.id, p.medication]));

  if (prescriptionIds.length === 0) {
    return {
      patient: { ...patient, adherenceRatePct: 0, dosesTaken: 0, dosesMissed: 0 },
      weekStatus: [],
      recentDoses: [],
    };
  }

  const { data: allDoses } = await supabase
    .from('dose_reminders')
    .select('id, prescription_id, scheduled_for, confirmed, confirmed_at')
    .in('prescription_id', prescriptionIds)
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: false });

  const rows = allDoses ?? [];
  const dosesTaken = rows.filter((d) => d.confirmed).length;
  const dosesMissed = rows.length - dosesTaken;
  const adherenceRatePct = rows.length === 0 ? 0 : Math.round((dosesTaken / rows.length) * 100);

  // Current week, Monday -> Sunday.
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekStatus: { day: string; status: DayStatus }[] = dayLabels.map((label, i) => {
    const dayStart = new Date(monday);
    dayStart.setDate(monday.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    if (dayStart > now) return { day: label, status: 'pending' as DayStatus };

    const dayDoses = rows.filter((d) => {
      const t = new Date(d.scheduled_for);
      return t >= dayStart && t <= dayEnd;
    });
    if (dayDoses.length === 0) return { day: label, status: 'none' as DayStatus };
    const allTaken = dayDoses.every((d) => d.confirmed);
    return { day: label, status: (allTaken ? 'taken' : 'missed') as DayStatus };
  });

  const recentDoses: DoseHistoryRow[] = rows.slice(0, 15).map((d) => {
    let status: DoseHistoryRow['status'];
    if (!d.confirmed) {
      status = 'missed';
    } else if (d.confirmed_at && new Date(d.confirmed_at).getTime() - new Date(d.scheduled_for).getTime() > 60 * 60 * 1000) {
      status = 'late';
    } else {
      status = 'taken';
    }
    return {
      id: d.id,
      scheduledFor: d.scheduled_for,
      medication: medicationById.get(d.prescription_id) ?? 'Unknown',
      status,
    };
  });

  return {
    patient: { ...patient, adherenceRatePct, dosesTaken, dosesMissed },
    weekStatus,
    recentDoses,
  };
}

export async function getAllPatients(): Promise<PatientSummary[]> {
  const { data: patients, error } = await supabase.from('patients').select('id, name, phone').order('name');
  if (error) throw error;

  // N+1 is fine at pilot scale (single facility, dozens of patients, not thousands).
  const withStats = await Promise.all(
    (patients ?? []).map(async (p) => {
      const { data: prescriptions } = await supabase.from('prescriptions').select('id').eq('patient_id', p.id);
      const prescriptionIds = (prescriptions ?? []).map((pr) => pr.id);
      if (prescriptionIds.length === 0) return { ...p, adherenceRatePct: 0, dosesTaken: 0, dosesMissed: 0 };

      const { data: doses } = await supabase
        .from('dose_reminders')
        .select('confirmed')
        .in('prescription_id', prescriptionIds)
        .lte('scheduled_for', new Date().toISOString());
      const rows = doses ?? [];
      const dosesTaken = rows.filter((d) => d.confirmed).length;
      return {
        ...p,
        dosesTaken,
        dosesMissed: rows.length - dosesTaken,
        adherenceRatePct: rows.length === 0 ? 0 : Math.round((dosesTaken / rows.length) * 100),
      };
    })
  );
  return withStats;
}
