import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Footprints, ClipboardList, Download, ArrowLeft } from 'lucide-react';
import { getDischargeSummary, type DischargeSummaryData } from '../services/supabaseDischargeService';
import { downloadCsv } from '../lib/exportCsv';

// Matches the content of Figma node 1:11639 "Patient Discharge Summary -
// Completion Overview" -- computed from real dose_reminders data. Kept
// inside the staff shell (Figma renders this screen with separate "Patient
// Portal" branding, a patient-facing login) since the pilot is staff-only
// per the proposal -- this is a summary a nurse reviews/prints for the
// patient, not a real patient login system.
//
// Was hardcoded to always show one demo patient regardless of who was
// actually being discharged -- now takes :patientId from the route
// (reached via "View Discharge Summary" on a patient's history page),
// falling back to the original seeded demo patient only when opened
// directly from the sidebar with no specific patient in mind.
const DEMO_PATIENT_ID = '44444444-4444-4444-4444-444444444444'; // Chantal Iribagiza, seeded with a full dose history

function consistencyLabel(pct: number): { label: string; message: string } {
  if (pct >= 90) return { label: 'Excellent Consistency!', message: "You've successfully completed your monitored treatment period. Your dedication to the tracking protocol has significantly contributed to your health progress." };
  if (pct >= 75) return { label: 'Good Progress', message: 'Your adherence is solid but there were a few missed confirmations. Keep up the daily routine.' };
  return { label: 'Needs Follow-Up', message: 'Several doses were missed during this period. A follow-up conversation with your care team is recommended.' };
}

export default function PatientDischargeSummary() {
  const { patientId } = useParams<{ patientId?: string }>();
  const [summary, setSummary] = useState<DischargeSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDischargeSummary(patientId ?? DEMO_PATIENT_ID).then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }, [patientId]);

  if (loading) return <div className="text-body">Loading summary…</div>;
  if (!summary) return <div className="text-body">No monitoring data found for this patient.</div>;

  const { label, message } = consistencyLabel(summary.adherenceRatePct);

  function handleDownload() {
    if (!summary) return;
    downloadCsv(
      `discharge-summary-${summary.patientName.replace(/\s+/g, '-').toLowerCase()}.csv`,
      summary.medications.map((m) => ({
        patient: summary.patientName,
        monitoring_start: summary.monitoringStart,
        monitoring_end: summary.monitoringEnd,
        overall_adherence_pct: summary.adherenceRatePct,
        medication: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        completed: m.completed ? 'Yes' : 'In Progress',
      }))
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Adherence Completion Summary</h1>
        <p className="text-body">
          {summary.patientName} · {new Date(summary.monitoringStart).toLocaleDateString()} – {new Date(summary.monitoringEnd).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center gap-8 rounded-lg border border-border bg-gradient-to-br from-success-bg/30 to-white p-8 shadow-sm">
          <div className="relative flex size-32 shrink-0 items-center justify-center rounded-full border-8 border-success">
            <div className="text-center">
              <p className="text-3xl font-bold text-success-text">{summary.adherenceRatePct}%</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-body">Adherence</p>
            </div>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <ShieldCheck size={20} className="text-success" />
              {label}
            </h2>
            <p className="mt-2 text-sm text-body">{message}</p>
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
        <div className="overflow-x-auto">
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
            {summary.medications.map((m, i) => (
              <tr key={m.name} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                <td className="px-5 py-3 text-sm font-semibold text-navy-light">{m.name}</td>
                <td className="px-5 py-3 text-sm text-body">{m.dosage}</td>
                <td className="px-5 py-3 text-sm text-body">{m.frequency}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${m.completed ? 'bg-success-bg text-success-text' : 'bg-warning-bg text-warning-text'}`}>
                    {m.completed ? '✓ Completed' : 'In Progress'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link to="/patients" className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-body">
          <ArrowLeft size={15} />
          Back to Patient Directory
        </Link>
        <button onClick={handleDownload} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
          <Download size={15} />
          Download Full Report
        </button>
      </div>
    </div>
  );
}
