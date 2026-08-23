import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock } from 'lucide-react';
import { getPatientHistory, type PatientHistory, type DayStatus } from '../services/supabasePatientHistoryService';

const dayIcon: Record<DayStatus, { bg: string; icon: React.ReactNode }> = {
  taken: { bg: 'bg-success text-white', icon: <Check size={16} /> },
  missed: { bg: 'bg-danger text-white', icon: <X size={16} /> },
  pending: { bg: 'bg-row-alt text-body', icon: <Clock size={16} /> },
  none: { bg: 'bg-row-alt text-body', icon: <Clock size={16} /> },
};

const statusStyles: Record<string, string> = {
  taken: 'bg-success-bg text-success-text',
  missed: 'bg-danger-bg text-danger-text',
  late: 'bg-warning-bg text-warning-text',
  pending: 'bg-row-alt text-body',
};

// Matches Figma node 1:7697 "Patient Adherence History" -- the answer to
// "how does a nurse or CHW see which days a patient missed a dose, across
// possibly more than one medication." Weekly streak shows a daily rollup;
// Detailed History below shows every individual dose confirmation, one row
// per medication per scheduled time, so multiple medications never get
// conflated into a single status.
export default function PatientHistoryPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    getPatientHistory(patientId).then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, [patientId]);

  if (loading) return <div className="text-body">Loading patient history…</div>;
  if (!history) return <div className="text-body">Patient not found.</div>;

  return (
    <div className="flex flex-col gap-6">
      <Link to=".." className="flex w-fit items-center gap-2 text-sm font-semibold text-navy-light">
        <ArrowLeft size={15} />
        Back
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-ink">{history.patient.name}</h1>
        <p className="text-body">{history.patient.phone}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Adherence Rate</p>
          <p className="text-3xl font-bold text-navy">{history.patient.adherenceRatePct}%</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Doses Taken</p>
          <p className="text-3xl font-bold text-success-text">{history.patient.dosesTaken}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Doses Missed</p>
          <p className="text-3xl font-bold text-danger">{history.patient.dosesMissed}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">Current Week Streak</h2>
        {history.weekStatus.length === 0 ? (
          <p className="text-sm text-body">No prescriptions on file for this patient yet.</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {history.weekStatus.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-white p-3">
                <span className="text-xs font-semibold text-body">{d.day}</span>
                <span className={`flex size-9 items-center justify-center rounded-full ${dayIcon[d.status].bg}`}>
                  {dayIcon[d.status].icon}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border bg-bg px-6 py-4">
          <h3 className="text-lg font-bold text-ink">Detailed History</h3>
        </div>
        <table className="w-full">
          <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Medication</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.recentDoses.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-6 text-center text-sm text-body">No dose history yet.</td></tr>
            ) : (
              history.recentDoses.map((dose, i) => (
                <tr key={dose.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                  <td className="px-6 py-3 text-sm text-body">{new Date(dose.scheduledFor).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-ink">{dose.medication}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[dose.status]}`}>{dose.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
