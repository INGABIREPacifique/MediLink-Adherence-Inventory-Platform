import { useEffect, useState } from 'react';
import { getPatientHistory, updatePatientContactPreferences } from '../../services/supabasePatientHistoryService';

// Real data: phone loads from and saves to patients.phone; channel/
// language save to every active prescription for this patient (see
// updatePatientContactPreferences for why -- the schema stores these
// per-medication, not as a single patient-level field).
const DEMO_PATIENT_ID = '44444444-4444-4444-4444-444444444444'; // Chantal Iribagiza, seeded with a full dose history

export default function PatientSettings() {
  const [channel, setChannel] = useState('ussd');
  const [language, setLanguage] = useState('rw');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPatientHistory(DEMO_PATIENT_ID).then((history) => {
      setPhone(history.patient.phone);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updatePatientContactPreferences(DEMO_PATIENT_ID, {
      phone,
      preferredChannel: channel as 'ussd' | 'ivr' | 'sms',
      language: language as 'rw' | 'en' | 'fr',
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Settings</h1>
        <p className="text-body">How MediLink reaches you.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex max-w-md flex-col gap-4 rounded-lg border border-border bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Phone Number
          <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} className="rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink disabled:opacity-50" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Preferred Reminder Channel
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink">
            <option value="ussd">USSD</option>
            <option value="ivr">Voice Call (IVR)</option>
            <option value="sms">SMS</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Language
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink">
            <option value="rw">Kinyarwanda</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>
        <button type="submit" disabled={saving || loading} className="mt-2 w-fit rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
        {saved && <p className="text-sm font-semibold text-success-text">Saved — applies to all your active medications.</p>}
      </form>
    </div>
  );
}
