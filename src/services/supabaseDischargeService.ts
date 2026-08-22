import { supabase } from '../lib/supabaseClient';

export interface DischargeSummaryData {
  patientName: string;
  monitoringStart: string;
  monitoringEnd: string;
  adherenceRatePct: number;
  medications: { name: string; dosage: string; frequency: string; completed: boolean }[];
}

// Computes a real discharge/monitoring summary from actual dose_reminders +
// prescriptions rows for a given patient -- not a hardcoded 92% mock.
export async function getDischargeSummary(patientId: string): Promise<DischargeSummaryData | null> {
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('name')
    .eq('id', patientId)
    .single();
  if (patientError || !patient) return null;

  const { data: prescriptions, error: presError } = await supabase
    .from('prescriptions')
    .select('id, medication, dosage, times_per_day, start_date')
    .eq('patient_id', patientId);
  if (presError) throw presError;

  const medications = await Promise.all(
    (prescriptions ?? []).map(async (p) => {
      const { data: doses } = await supabase
        .from('dose_reminders')
        .select('confirmed')
        .eq('prescription_id', p.id)
        .lte('scheduled_for', new Date().toISOString());
      const rows = doses ?? [];
      const completed = rows.length > 0 && rows.every((d) => d.confirmed);
      return {
        name: p.medication,
        dosage: p.dosage ?? '',
        frequency: p.times_per_day === 1 ? 'Once daily' : `${p.times_per_day}x daily`,
        completed,
        _confirmedCount: rows.filter((d) => d.confirmed).length,
        _totalCount: rows.length,
      };
    })
  );

  const totalDoses = medications.reduce((sum, m) => sum + m._totalCount, 0);
  const confirmedDoses = medications.reduce((sum, m) => sum + m._confirmedCount, 0);
  const adherenceRatePct = totalDoses === 0 ? 0 : Math.round((confirmedDoses / totalDoses) * 100);

  const startDates = (prescriptions ?? []).map((p) => p.start_date).sort();

  return {
    patientName: patient.name,
    monitoringStart: startDates[0] ?? new Date().toISOString(),
    monitoringEnd: new Date().toISOString(),
    adherenceRatePct,
    medications: medications.map(({ name, dosage, frequency, completed }) => ({ name, dosage, frequency, completed })),
  };
}
