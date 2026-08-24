import { useEffect, useState } from 'react';
import { UserPlus, ClipboardList, Check, Plus, Trash2 } from 'lucide-react';
import { enrollmentService } from '../services';
import { supabase } from '../lib/supabaseClient';
import type { EnrollmentDraft, PrescriptionSchedule } from '../types';

const DOSE_SLOTS = [
  { time: '08:00', label: 'Morning' },
  { time: '12:00', label: 'Midday' },
  { time: '16:00', label: 'Afternoon' },
  { time: '20:00', label: 'Evening' },
];

function emptyMedication(): PrescriptionSchedule {
  return { medication: '', dosage: '', timesPerDay: 2, scheduleTimes: ['08:00', '20:00'], startDate: new Date().toISOString().slice(0, 10) };
}

const emptyDraft: EnrollmentDraft = {
  patientName: '', phone: '', preferredChannel: 'ussd', language: 'rw',
  medications: [emptyMedication()],
  nextFollowUpDate: '',
};

// Matches Figma node 1:12760 "MVP Staff Registration - Patient Enrollment",
// extended to support MULTIPLE medications per patient -- most discharged
// patients take more than one (e.g. a TB regimen, or a post-surgical
// combination), and each is confirmed independently via its own USSD
// reminder schedule, so each needs its own prescription row + dose times.
// Previously this entire screen wrote to nothing real (mockEnrollmentService)
// -- now backed by enrollmentService, which creates a real patient,
// real prescriptions (one per medication), real dose_reminders, and a
// real follow-up appointment.
export default function StaffRegistration() {
  const [draft, setDraft] = useState<EnrollmentDraft>(emptyDraft);
  const [nationalId, setNationalId] = useState('');
  const [chwList, setChwList] = useState<{ id: string; full_name: string }[]>([]);
  const [assignedChwId, setAssignedChwId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('profiles').select('id, full_name').eq('role', 'chw').then(({ data }) => setChwList(data ?? []));
  }, []);

  function updateMedication(index: number, patch: Partial<PrescriptionSchedule>) {
    setDraft((d) => ({
      ...d,
      medications: d.medications.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  }

  function toggleSlot(index: number, time: string) {
    setDraft((d) => {
      const med = d.medications[index];
      const times = med.scheduleTimes.includes(time)
        ? med.scheduleTimes.filter((t) => t !== time)
        : [...med.scheduleTimes, time];
      return {
        ...d,
        medications: d.medications.map((m, i) => (i === index ? { ...m, scheduleTimes: times, timesPerDay: times.length } : m)),
      };
    });
  }

  function addMedication() {
    setDraft((d) => ({ ...d, medications: [...d.medications, emptyMedication()] }));
  }

  function removeMedication(index: number) {
    setDraft((d) => ({ ...d, medications: d.medications.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const patient = await enrollmentService.enrollPatient(draft, assignedChwId || null);
      setEnrolled(patient.name);
      setDraft(emptyDraft);
      setNationalId('');
      setAssignedChwId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Register Patient for Adherence</h1>
        <p className="text-body">Enroll a newly discharged patient into the digital medication tracking protocol to ensure continuity of care.</p>
      </div>

      {enrolled && (
        <p className="max-w-2xl rounded-lg border border-success/30 bg-success-bg/40 p-4 text-sm font-semibold text-success-text">
          {enrolled} enrolled with {draft.medications.length === 1 ? '1 medication' : `${draft.medications.length} medications`}. Reminder schedules created.
        </p>
      )}
      {error && (
        <p className="max-w-2xl rounded-lg border border-danger/30 bg-danger-bg/40 p-4 text-sm font-semibold text-danger-text">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6 rounded-lg border border-border bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
            <UserPlus size={18} />
            Patient Demographics
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
              <ClipboardList size={18} />
              Medication Protocol
            </h2>
            <button type="button" onClick={addMedication} className="flex items-center gap-1.5 text-sm font-semibold text-navy-light">
              <Plus size={14} />
              Add Medication
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {draft.medications.map((med, index) => (
              <div key={index} className="rounded-lg border border-border bg-bg p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-body">Medication {index + 1}</p>
                  {draft.medications.length > 1 && (
                    <button type="button" onClick={() => removeMedication(index)} aria-label="Remove medication" className="text-danger hover:opacity-70">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="col-span-2 flex flex-col gap-1.5 text-sm font-semibold text-body">
                    Medication Name
                    <input required value={med.medication} onChange={(e) => updateMedication(index, { medication: e.target.value })}
                      placeholder="e.g. Amoxicillin" className="rounded border border-border bg-white px-3 py-2 text-base font-normal text-ink" />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
                    Dosage
                    <input value={med.dosage} onChange={(e) => updateMedication(index, { dosage: e.target.value })}
                      placeholder="e.g. 500mg" className="rounded border border-border bg-white px-3 py-2 text-base font-normal text-ink" />
                  </label>
                </div>

                <p className="mb-2 mt-3 text-xs font-semibold text-body">Daily Dose Schedule</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DOSE_SLOTS.map((slot) => {
                    const checked = med.scheduleTimes.includes(slot.time);
                    return (
                      <button
                        type="button"
                        key={slot.time}
                        onClick={() => toggleSlot(index, slot.time)}
                        className={`flex flex-col items-start gap-1 rounded-lg border p-2 text-left ${
                          checked ? 'border-navy bg-navy text-white' : 'border-border bg-white text-ink'
                        }`}
                      >
                        <span className={`flex size-3.5 items-center justify-center rounded-sm border ${checked ? 'border-white bg-white' : 'border-border'}`}>
                          {checked && <Check size={10} className="text-navy" />}
                        </span>
                        <span className="text-xs font-semibold">{slot.time}</span>
                        <span className={`text-[10px] ${checked ? 'text-white/80' : 'text-body'}`}>{slot.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <label className="mt-5 flex flex-col gap-1.5 text-sm font-semibold text-body">
            Next Follow-up Date
            <input type="date" required value={draft.nextFollowUpDate} onChange={(e) => setDraft({ ...draft, nextFollowUpDate: e.target.value })}
              className="w-fit rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink" />
          </label>

          <label className="mt-4 flex flex-col gap-1.5 text-sm font-semibold text-body">
            Assign Community Health Worker (optional)
            <select value={assignedChwId} onChange={(e) => setAssignedChwId(e.target.value)}
              className="w-fit min-w-[240px] rounded border border-border bg-bg px-3 py-2.5 text-base font-normal text-ink">
              <option value="">Unassigned -- visible to any CHW</option>
              {chwList.map((chw) => (
                <option key={chw.id} value={chw.id}>{chw.full_name}</option>
              ))}
            </select>
          </label>
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
