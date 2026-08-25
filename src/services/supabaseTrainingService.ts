import { supabase } from '../lib/supabaseClient';

export interface TrainingModule {
  key: string;
  title: string;
  description: string;
  estMinutes: number;
}

// Real onboarding content describing how THIS actual system works --
// not filler text. Matches the shape of Figma's "CHW Training &
// Onboarding Portal" curriculum, adapted to the pilot's real features.
export const TRAINING_MODULES: TrainingModule[] = [
  { key: 'ussd_basics', title: 'How USSD Confirmation Works', description: 'How patients confirm doses from home via USSD, and what happens when a confirmation is missed.', estMinutes: 5 },
  { key: 'handling_escalations', title: 'Handling Escalations', description: 'How to read the Priority Tasks list, call a patient, and log a home visit outcome.', estMinutes: 8 },
  { key: 'recording_visits', title: 'Recording Field Visits', description: 'Standard procedure for logging a home visit in the Visit Log, including outcomes and notes.', estMinutes: 6 },
  { key: 'local_inventory', title: 'Logging Local Inventory Usage', description: 'How to log supplies used during a home visit from the Local Inventory screen.', estMinutes: 4 },
  { key: 'patient_history', title: 'Reading Patient Adherence History', description: 'How to interpret the weekly adherence streak and detailed dose history for a patient.', estMinutes: 5 },
];

export async function getCompletedModules(chwId: string): Promise<string[]> {
  const { data, error } = await supabase.from('chw_training_progress').select('module_key').eq('chw_id', chwId);
  if (error) throw error;
  return (data ?? []).map((r) => r.module_key);
}

export async function completeModule(chwId: string, moduleKey: string): Promise<void> {
  const { error } = await supabase.from('chw_training_progress').upsert({ chw_id: chwId, module_key: moduleKey }, { onConflict: 'chw_id,module_key' });
  if (error) throw error;
}
