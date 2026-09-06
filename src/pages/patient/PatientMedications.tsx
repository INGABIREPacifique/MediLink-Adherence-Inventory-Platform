import { Pill, Clock, ShieldAlert } from 'lucide-react';

// FRONTEND ONLY -- mock data. Mirrors what a nurse records in Staff
// Registration at enrollment/discharge -- read-only here, no edit controls,
// per the "nurse owns it, patient just sees it" design.
const medications = [
  { name: 'Rifampicin/Isoniazid', dosage: '150mg/75mg', schedule: '8:00 AM', instructions: 'Take on an empty stomach, at least 1 hour before food.' },
  { name: 'Pyridoxine', dosage: '25mg', schedule: '8:00 PM', instructions: 'Take with your evening meal.' },
];

const allergies = ['Penicillin'];

export default function PatientMedications() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Your Medications</h1>
        <p className="text-body">What you're taking and when.</p>
      </div>

      {allergies.length > 0 && (
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
