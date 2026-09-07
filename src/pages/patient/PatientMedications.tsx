import { useEffect, useState } from 'react';
import { Pill, Clock, ShieldAlert } from 'lucide-react';
import { getPatientHistory } from '../../services/supabasePatientHistoryService';

// Medications list below is still mock -- this page isn't wired to
// prescriptions yet. Allergies are real as of migration 0015
// (patients.known_allergies), pulled via the same DEMO_PATIENT_ID pattern
// used in PatientDischargeSummary until real patient login exists.
// Read-only here either way, no edit controls, per the "nurse owns it,
// patient just sees it" design.
const DEMO_PATIENT_ID = '44444444-4444-4444-4444-444444444444'; // Chantal Iribagiza, seeded with a full dose history

const medications = [
  { name: 'Rifampicin/Isoniazid', dosage: '150mg/75mg', schedule: '8:00 AM', instructions: 'Take on an empty stomach, at least 1 hour before food.' },
  { name: 'Pyridoxine', dosage: '25mg', schedule: '8:00 PM', instructions: 'Take with your evening meal.' },
];

export default function PatientMedications() {
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
        <h1 className="text-3xl font-bold text-ink">Your Medications</h1>
        <p className="text-body">What you're taking and when.</p>
      </div>

      {!loading && allergies.length > 0 && (
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-danger-text">
            <ShieldAlert size={16} />
            Known Allergies
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {allergies.map((a) => (
              <span key={a} className="rounded-full border border-danger/30 bg-white px-3 py-1 text-xs font-semibold text-danger-text">{a}</span>
            ))}
          </div>
          <p className="mt-2 text-xs font-normal text-danger-text/80">
            Recorded by your care team. If this is incorrect or out of date, tell your nurse or doctor at your next visit.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <div key={med.name} className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy">
                <Pill size={18} />
              </span>
              <div>
                <p className="font-bold text-ink">{med.name}</p>
                <p className="text-sm text-body">{med.dosage}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-navy-light">
                  <Clock size={12} />
                  {med.schedule}
                </p>
                <p className="mt-2 text-sm text-body">{med.instructions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
