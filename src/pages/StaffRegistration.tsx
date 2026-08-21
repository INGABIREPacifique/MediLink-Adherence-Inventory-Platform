import { useState } from 'react';
import { UserPlus, ClipboardList, Check } from 'lucide-react';
import { mockEnrollmentService } from '../services/mockEnrollmentService';
import type { EnrollmentDraft } from '../types';

const DOSE_SLOTS = [
  { time: '08:00', label: 'Morning' },
  { time: '12:00', label: 'Midday' },
  { time: '16:00', label: 'Afternoon' },
  { time: '20:00', label: 'Evening' },
];

const emptyDraft: EnrollmentDraft = {
  patientName: '', phone: '', preferredChannel: 'ussd', language: 'rw',
  prescription: { medication: '', dosage: '', timesPerDay: 2, scheduleTimes: ['08:00', '20:00'], startDate: new Date().toISOString().slice(0, 10) },
  nextFollowUpDate: '',
};

// Matches Figma node 1:12760 "MVP Staff Registration - Patient Enrollment"
// exactly: "Register Patient for Adherence" title, National ID field,
// checkbox-style daily dose schedule (not free-text times) -- proposal §3.1:
// "CHW-assisted onboarding... before leaving the hospital."
export default function StaffRegistration() {
  const [draft, setDraft] = useState<EnrollmentDraft>(emptyDraft);
  const [nationalId, setNationalId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState<string | null>(null);

  function toggleSlot(time: string) {
    setDraft((d) => {
      const times = d.prescription.scheduleTimes.includes(time)
        ? d.prescription.scheduleTimes.filter((t) => t !== time)
        : [...d.prescription.scheduleTimes, time];
      return { ...d, prescription: { ...d.prescription, scheduleTimes: times, timesPerDay: times.length } };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const patient = await mockEnrollmentService.enrollPatient(draft);
    setEnrolled(patient.name);
    setSubmitting(false);
    setDraft(emptyDraft);
    setNationalId('');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Register Patient for Adherence</h1>
        <p className="text-body">Enroll a newly discharged patient into the digital medication tracking protocol to ensure continuity of care.</p>
      </div>

      {enrolled && (
        <p className="max-w-2xl rounded-lg border border-success/30 bg-success-bg/40 p-4 text-sm font-semibold text-success-text">
          {enrolled} enrolled. Reminder schedule created.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6 rounded-lg border border-border bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
            <UserPlus size={18} />
            Patient Demographics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
              Full Name
              <input required value={draft.patientName} onChange={(e) => setDraft({ ...draft, patientName: e.target.value })}
                placeholder="e.g. Jean Claude Nsengiyumva" className="rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
              National ID (NID)
              <input value={nationalId} onChange={(e) => setNationalId(e.target.value)}
                placeholder="1 1990 8 0000000 0 00" className="rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Primary Phone Number (SMS Alerts)
            <input required value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              placeholder="+250 780 000 000" className="rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink" />
            <span className="text-xs font-normal text-body">This number will receive daily medication reminders.</span>
          </label>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-navy">
            <ClipboardList size={18} />
            Medication Protocol
          </h2>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Primary Medication Name
            <input required value={draft.prescription.medication}
              onChange={(e) => setDraft({ ...draft, prescription: { ...draft.prescription, medication: e.target.value } })}
              placeholder="e.g. Amoxicillin 500mg" className="rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink" />
          </label>

          <p className="mb-2 mt-4 text-sm font-semibold text-body">Daily Dose Schedule</p>
          <div className="grid grid-cols-4 gap-3">
            {DOSE_SLOTS.map((slot) => {
              const checked = draft.prescription.scheduleTimes.includes(slot.time);
              return (
                <button
                  type="button"
                  key={slot.time}
                  onClick={() => toggleSlot(slot.time)}
                  className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left ${
                    checked ? 'border-navy bg-navy text-white' : 'border-border bg-white text-ink'
                  }`}
                >
                  <span className={`flex size-4 items-center justify-center rounded-sm border ${checked ? 'border-white bg-white' : 'border-border'}`}>
                    {checked && <Check size={12} className="text-navy" />}
                  </span>
                  <span className="text-sm font-semibold">{slot.time}</span>
                  <span className={`text-xs ${checked ? 'text-white/80' : 'text-body'}`}>{slot.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <button type="button" onClick={() => setDraft(emptyDraft)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-body">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50">
            <UserPlus size={15} />
            {submitting ? 'Enrolling…' : 'Register & Onboard'}
          </button>
        </div>
      </form>
    </div>
  );
}
