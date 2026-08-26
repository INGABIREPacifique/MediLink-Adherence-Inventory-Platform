import { useState } from 'react';

// FRONTEND ONLY -- form state is local only, does not persist anywhere yet.
export default function PatientSettings() {
  const [channel, setChannel] = useState('ussd');
  const [language, setLanguage] = useState('rw');
  const [phone, setPhone] = useState('+250 788 123 456');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Settings</h1>
        <p className="text-body">How MediLink reaches you.</p>
      </div>

      <form className="flex max-w-md flex-col gap-4 rounded-lg border border-border bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Phone Number
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink" />
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
        <button type="button" className="mt-2 w-fit rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
          Save Preferences
        </button>
      </form>
    </div>
  );
}
