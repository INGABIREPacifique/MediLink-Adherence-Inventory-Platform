import { supabase } from '../lib/supabaseClient';
import type { EnrollmentDraft, Patient } from '../types';
import type { EnrollmentService } from './enrollmentService';

// Real Supabase-backed enrollment -- previously this entire flow was mock
// (mockEnrollmentService), meaning every "successful" enrollment created
// nothing in the actual database. This writes:
//   1. one patients row
//   2. one prescriptions row PER medication (most discharged patients take
//      more than one -- e.g. a TB regimen or post-surgical combination --
//      and each is confirmed independently via USSD, so each needs its
//      own prescription + dose schedule)
//   3. dose_reminders generated 30 days forward per prescription, so the
//      USSD Simulator / Escalation Inbox / Discharge Summary all have real
//      data immediately, not just from tomorrow onward
//   4. one appointments row for the follow-up date
//
// Production note: a real system would also run a small daily job to keep
// extending dose_reminders forward (this only pre-generates 30 days at
// enrollment time) -- documented here rather than silently left out.
export async function enrollPatient(draft: EnrollmentDraft): Promise<Patient> {
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .insert({ name: draft.patientName, phone: draft.phone })
    .select('id, name, phone')
    .single();
  if (patientError || !patient) throw patientError ?? new Error('Failed to create patient');

  for (const med of draft.medications) {
    if (!med.medication.trim()) continue; // skip empty rows

    const { data: prescription, error: presError } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: patient.id,
        medication: med.medication,
        dosage: med.dosage,
        times_per_day: med.scheduleTimes.length || 1,
        schedule_times: med.scheduleTimes.length ? med.scheduleTimes : ['08:00'],
        start_date: med.startDate,
        preferred_channel: draft.preferredChannel,
        language: draft.language,
      })
      .select('id, schedule_times, start_date')
      .single();
    if (presError || !prescription) throw presError ?? new Error('Failed to create prescription');

    // Generate 30 days of dose_reminders forward from the start date.
    const doseRows: { prescription_id: string; scheduled_for: string; channel: string }[] = [];
    const startDate = new Date(prescription.start_date);
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      for (const time of prescription.schedule_times as string[]) {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledFor = new Date(startDate);
        scheduledFor.setDate(scheduledFor.getDate() + dayOffset);
        scheduledFor.setHours(hours, minutes, 0, 0);
        doseRows.push({
          prescription_id: prescription.id,
          scheduled_for: scheduledFor.toISOString(),
          channel: draft.preferredChannel,
        });
      }
    }
    if (doseRows.length > 0) {
      const { error: doseError } = await supabase.from('dose_reminders').insert(doseRows);
      if (doseError) throw doseError;
    }
  }

  if (draft.nextFollowUpDate) {
    const { error: apptError } = await supabase.from('appointments').insert({
      patient_id: patient.id,
      scheduled_for: draft.nextFollowUpDate,
      status: 'scheduled',
    });
    if (apptError) throw apptError;
  }

  return { id: patient.id, name: patient.name, phone: patient.phone };
}

export const supabaseEnrollmentService: EnrollmentService = { enrollPatient };
