import { useEffect, useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { getPatientHistory, type PatientHistory } from '../../services/supabasePatientHistoryService';

// Real data via the same DEMO_PATIENT_ID pattern used elsewhere in the
// Patient Portal, until real patient login exists. Visual pattern
// matches the staff-facing PatientHistory.tsx -- both now read from the
// same real getPatientHistory() service, just rendered with first-person
// patient-facing copy here.
const DEMO_PATIENT_ID = '44444444-4444-4444-4444-444444444444'; // Chantal Iribagiza, seeded with a full dose history

const dayIcon: Record<string, { bg: string; icon: React.ReactNode }> = {
  taken: { bg: 'bg-success text-white', icon: <Check size={16} /> },
  missed: { bg: 'bg-danger text-white', icon: <X size={16} /> },
  pending: { bg: 'bg-row-alt text-body', icon: <Clock size={16} /> },
  none: { bg: 'bg-bg text-body', icon: null },
};

const statusStyles: Record<string, string> = {
  taken: 'bg-success-bg text-success-text',
  missed: 'bg-danger-bg text-danger-text',
  late: 'bg-warning-bg text-warning-text',
  pending: 'bg-row-alt text-body',
};

export default function PatientAdherence() {
  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientHistory(DEMO_PATIENT_ID).then(setHistory).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Your Adherence</h1>
        <p className="text-body">How consistently you've been taking your medication.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Adherence Rate</p>
          <p className="text-3xl font-bold text-navy">{loading ? '—' : `${history?.patient.adherenceRatePct}%`}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Doses Taken</p>
          <p className="text-3xl font-bold text-success-text">{loading ? '—' : history?.patient.dosesTaken}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Doses Missed</p>
          <p className="text-3xl font-bold text-danger">{loading ? '—' : history?.patient.dosesMissed}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">This Week</h2>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {(history?.weekStatus ?? []).map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-white p-1.5 sm:gap-1.5 sm:p-3">
              <span className="text-[10px] font-semibold text-body sm:text-xs">{d.day}</span>
              <span className={`flex size-7 items-center justify-center rounded-full sm:size-9 ${dayIcon[d.status].bg}`}>
                {dayIcon[d.status].icon}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border bg-bg px-6 py-4">
          <h3 className="text-lg font-bold text-ink">Recent History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Medication</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={3} className="px-6 py-6 text-center text-sm text-body">Loading…</td></tr>}
              {!loading && (history?.recentDoses.length ?? 0) === 0 && <tr><td colSpan={3} className="px-6 py-6 text-center text-sm text-body">No dose history yet.</td></tr>}
              {history?.recentDoses.map((dose, i) => (
                <tr key={dose.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                  <td className="px-6 py-3 text-sm text-body">{new Date(dose.scheduledFor).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-ink">{dose.medication}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[dose.status]}`}>{dose.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
