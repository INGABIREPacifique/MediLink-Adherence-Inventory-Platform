import { Pill, Clock } from 'lucide-react';

// FRONTEND ONLY -- mock data.
const medications = [
  { name: 'Rifampicin/Isoniazid', dosage: '150mg/75mg', schedule: '8:00 AM', instructions: 'Take on an empty stomach, at least 1 hour before food.' },
  { name: 'Pyridoxine', dosage: '25mg', schedule: '8:00 PM', instructions: 'Take with your evening meal.' },
];

export default function PatientMedications() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Your Medications</h1>
        <p className="text-body">What you're taking and when.</p>
      </div>

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
