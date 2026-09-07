import { useEffect, useState } from 'react';
import { ShieldAlert, Stethoscope, Pill } from 'lucide-react';
import { getPatientHistory } from '../../services/supabasePatientHistoryService';

// Read-only mirror of the nurse-facing PatientMedicalRecord page
// (src/pages/PatientMedicalRecord.tsx). No edit controls anywhere on this
// page, by design: the patient can view but the nurse/care team owns the
// record.
//
// This is the screen meant to solve the "traveled abroad, foreign
// hospital has no way to see my medical history" problem -- the patient
// opens their portal (once real phone+OTP auth exists, per the handoff
// doc's deferred decision) and a foreign provider can read this directly.
// No separate export/sharing system invented here; visibility through the
// portal itself is the mechanism, per explicit direction.
//
// Allergies are real as of migration 0015 (patients.known_allergies),
// pulled via the same DEMO_PATIENT_ID pattern used in
// PatientDischargeSummary until real patient login exists. Conditions and
// the medication list below are still mock -- no `conditions` table yet,
// and this page isn't wired to prescriptions yet either.
const DEMO_PATIENT_ID = '44444444-4444-4444-4444-444444444444'; // Chantal Iribagiza, seeded with a full dose history

const conditions = [{ name: 'Type 2 Diabetes', diagnosedOn: '2022-03-14' }];

const medications = [
  { name: 'Rifampicin/Isoniazid', dosage: '150mg/75mg', frequency: 'Twice daily', status: 'In progress' },
  { name: 'Pyridoxine', dosage: '25mg', frequency: 'Once daily', status: 'In progress' },
];

export default function PatientMedicalRecords() {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientHistory(DEMO_PATIENT_ID)
      .then((history) => setAllergies(history.patient.knownAllergies))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Your Medical Record</h1>
        <p className="text-body">Read-only. Maintained by your care team — show this to any provider, including abroad.</p>
      </div>

      <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-danger-text">
          <ShieldAlert size={16} />
          Known Allergies
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {loading && <span className="text-sm text-danger-text">Loading…</span>}
          {!loading && allergies.length === 0 && <span className="text-sm text-danger-text">None recorded.</span>}
          {allergies.map((a) => (
            <span key={a} className="rounded-full border border-danger/30 bg-white px-3 py-1 text-xs font-semibold text-danger-text">{a}</span>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-bold text-navy">
          <Stethoscope size={16} />
          Conditions &amp; Diagnoses
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {conditions.length === 0 && <span className="text-sm text-body">None recorded.</span>}
          {conditions.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded border border-border bg-bg px-3 py-2">
              <span className="text-sm font-semibold text-ink">{c.name}</span>
              <span className="text-xs text-body">Since {c.diagnosedOn}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-bold text-navy">
          <Pill size={16} />
          Current Medications
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {medications.map((m) => (
            <div key={m.name} className="flex items-center justify-between rounded border border-border bg-bg px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-ink">{m.name}</p>
                <p className="text-xs text-body">{m.dosage} — {m.frequency}</p>
              </div>
              <span className="rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning-text">{m.status}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-body">
        This record is view-only. If anything here looks incorrect or out of date, tell your nurse or doctor at your next visit — they update it, not you.
      </p>
    </div>
  );
}
