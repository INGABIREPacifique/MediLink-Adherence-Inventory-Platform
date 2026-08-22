import { supabase } from '../lib/supabaseClient';

export interface PendingDose {
  id: string;
  patientName: string;
  medication: string;
  scheduledFor: string;
}

export interface PendingAppointment {
  id: string;
  patientName: string;
  scheduledFor: string;
}

// Backs the USSD Simulator -- a real stand-in for the telecom gateway
// (Africa's Talking or similar) named in the proposal's Patient Interface
// Layer, which this pilot has no credentials to integrate for real.
// Confirming here writes to the actual dose_reminders/appointments tables,
// so it's a genuine test of the confirmation flow end-to-end, not a fake.
export async function getPendingDoses(): Promise<PendingDose[]> {
  const { data, error } = await supabase
    .from('dose_reminders')
    .select('id, scheduled_for, prescriptions:prescription_id ( medication, patients:patient_id ( name ) )')
    .eq('confirmed', false)
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: false })
    .limit(20);
  if (error) throw error;
  return ((data ?? []) as unknown as { id: string; scheduled_for: string; prescriptions: { medication: string; patients: { name: string } | null } | null }[]).map((r) => ({
    id: r.id,
    patientName: r.prescriptions?.patients?.name ?? 'Unknown patient',
    medication: r.prescriptions?.medication ?? '',
    scheduledFor: r.scheduled_for,
  }));
}

export async function confirmDose(doseReminderId: string): Promise<void> {
  const { error } = await supabase
    .from('dose_reminders')
    .update({ confirmed: true, confirmed_at: new Date().toISOString() })
    .eq('id', doseReminderId);
  if (error) throw error;
}

export async function getPendingAppointments(): Promise<PendingAppointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, scheduled_for, patients:patient_id ( name )')
    .eq('status', 'scheduled')
    .eq('confirmed', false)
    .order('scheduled_for', { ascending: true })
    .limit(20);
  if (error) throw error;
  return ((data ?? []) as unknown as { id: string; scheduled_for: string; patients: { name: string } | null }[]).map((r) => ({
    id: r.id,
    patientName: r.patients?.name ?? 'Unknown patient',
    scheduledFor: r.scheduled_for,
  }));
}

export async function confirmAppointment(appointmentId: string): Promise<void> {
  const { error } = await supabase.from('appointments').update({ confirmed: true }).eq('id', appointmentId);
  if (error) throw error;
}
