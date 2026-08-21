import { useState } from 'react';
import { mockEnrollmentService } from '../services/mockEnrollmentService';
import type { EnrollmentDraft } from '../types';

const emptyDraft: EnrollmentDraft = {
  patientName: '', phone: '', preferredChannel: 'ussd', language: 'rw',
  prescription: { medication: '', dosage: '', timesPerDay: 2, scheduleTimes: ['08:00', '20:00'], startDate: new Date().toISOString().slice(0, 10) },
  nextFollowUpDate: '',
};

// MVP Staff Registration — enrolls a discharged patient at the point of
// discharge (proposal §3.1: "CHW-assisted onboarding... before leaving the
// hospital"). Channel choice matters: USSD/IVR/SMS are the primary channels,
// per the proposal's accessibility-first design — smartphone app is Phase 2.
export default function StaffRegistration() {
  const [draft, setDraft] = useState<EnrollmentDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const patient = await mockEnrollmentService.enrollPatient(draft);
    setEnrolled(patient.name);
    setSubmitting(false);
    setDraft(emptyDraft);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-base text-ink">Patient Enrollment at Discharge</h2>
        <p className="max-w-xl text-base text-body">
          Register patient, prescription schedule, and preferred contact channel before they leave the ward.
        </p>
      </div>

      {enrolled && (
        <p className="max-w-xl rounded-lg border border-success/30 bg-success-bg/40 p-4 text-sm font-semibold text-success-text">
          {enrolled} enrolled. Reminder schedule created.
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid max-w-2xl grid-cols-2 gap-4 rounded-lg border border-border bg-white p-6 shadow-sm">
        <label className="col-span-2 flex flex-col gap-1.5 text-sm font-semibold text-body">
          Patient full name
          <input required value={draft.patientName} onChange={(e) => setDraft({ ...draft, patientName: e.target.value })}
            placeholder="e.g. Uwase Marie" className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Phone number
          <input required value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            placeholder="+250..." className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Preferred channel
          <select value={draft.preferredChannel} onChange={(e) => setDraft({ ...draft, preferredChannel: e.target.value as EnrollmentDraft['preferredChannel'] })}
            className="rounded border border-border px-3 py-2 text-base font-normal text-ink">
            <option value="ussd">USSD</option>
            <option value="ivr">IVR (voice, Kinyarwanda)</option>
            <option value="sms">SMS</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Language
          <select value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value as EnrollmentDraft['language'] })}
            className="rounded border border-border px-3 py-2 text-base font-normal text-ink">
            <option value="rw">Kinyarwanda</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Next follow-up date
          <input type="date" required value={draft.nextFollowUpDate} onChange={(e) => setDraft({ ...draft, nextFollowUpDate: e.target.value })}
            className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>

        <label className="col-span-2 flex flex-col gap-1.5 text-sm font-semibold text-body">
          Medication & dosage
          <input required value={draft.prescription.medication}
            onChange={(e) => setDraft({ ...draft, prescription: { ...draft.prescription, medication: e.target.value } })}
            placeholder="e.g. Amoxicillin 500mg, 2x daily" className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>

        <button type="submit" disabled={submitting}
          className="col-span-2 mt-2 w-fit rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50">
          {submitting ? 'Enrolling…' : 'Enroll Patient & Schedule Reminders'}
        </button>
      </form>
    </div>
  );
}
