import { ShieldCheck, Footprints, ClipboardList, Download, ArrowLeft } from 'lucide-react';

// Matches the content of Figma node 1:11639 "Patient Discharge Summary -
// Completion Overview" -- circular adherence ring, "Next Steps" panel,
// medication recap table. Figma renders this with "Patient Portal"
// branding (a patient-facing login), but the pilot is staff-only per the
// proposal (patients interact via USSD/IVR/SMS, not a web portal) -- so
// this stays inside the staff shell as a summary a nurse reviews/prints
// for the patient, not a separate patient login system.
const medications = [
  { name: 'Rifampicin / Isoniazid', dosage: '150mg / 75mg', frequency: 'Once daily', completed: true },
  { name: 'Ethambutol', dosage: '400mg', frequency: 'Once daily', completed: true },
];

export default function PatientDischargeSummary() {
  const adherenceRate = 92;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Adherence Completion Summary</h1>
        <p className="text-body">Jean-Baptiste Mugisha · Oct 1 – Oct 30, 2023</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center gap-8 rounded-lg border border-border bg-gradient-to-br from-success-bg/30 to-white p-8 shadow-sm">
          <div className="relative flex size-32 shrink-0 items-center justify-center rounded-full border-8 border-success">
            <div className="text-center">
              <p className="text-3xl font-bold text-success-text">{adherenceRate}%</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-body">Adherence</p>
            </div>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <ShieldCheck size={20} className="text-success" />
              Excellent Consistency!
            </h2>
            <p className="mt-2 text-sm text-body">
              You've successfully completed your monitored treatment period. Your dedication to the tracking protocol
              has significantly contributed to your health progress.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-ink">
            <Footprints size={16} className="text-navy" />
            Next Steps
          </h3>
          <div className="flex flex-col gap-4">
            {[
              <>Continue regular follow-ups with <span className="font-semibold text-navy-light">Kigali Central Hospital</span>.</>,
              <>Contact your Community Health Worker (CHW) if symptoms recur.</>,
              <>Maintain healthy dietary habits and hydration.</>,
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{i + 1}</span>
                <p className="text-sm text-ink">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="flex items-center gap-2 font-bold text-ink">
            <ClipboardList size={16} className="text-navy" />
            Medication Recap
          </h3>
        </div>
        <table className="w-full">
          <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
            <tr>
              <th className="px-5 py-3">Medication</th>
              <th className="px-5 py-3">Dosage</th>
              <th className="px-5 py-3">Frequency</th>
              <th className="px-5 py-3 text-right">Completion Status</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((m, i) => (
              <tr key={m.name} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                <td className="px-5 py-3 text-sm font-semibold text-navy-light">{m.name}</td>
                <td className="px-5 py-3 text-sm text-body">{m.dosage}</td>
                <td className="px-5 py-3 text-sm text-body">{m.frequency}</td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">
                    ✓ Completed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-body">
          <ArrowLeft size={15} />
          Back to Patient Registry
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
          <Download size={15} />
          Download Full Report
        </button>
      </div>
    </div>
  );
}
