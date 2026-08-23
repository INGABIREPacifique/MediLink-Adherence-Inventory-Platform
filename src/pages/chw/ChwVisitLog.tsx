import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { getChwPatients, getChwVisits, logChwVisit, type ChwPatient, type ChwVisit } from '../../services/supabaseChwService';

const outcomeStyles: Record<ChwVisit['outcome'], string> = {
  visited: 'bg-success-bg text-success-text',
  unreachable: 'bg-danger-bg text-danger-text',
  rescheduled: 'bg-warning-bg text-warning-text',
};

// Matches Figma node 1:1909 "CHW Field App - Visit Log" content --
// a form to log a new visit plus a real history of past visits, all
// written to the chw_visits table (supabase/migrations/0007_chw_visits.sql).
export default function ChwVisitLog() {
  const [patients, setPatients] = useState<ChwPatient[]>([]);
  const [visits, setVisits] = useState<ChwVisit[]>([]);
  const [patientId, setPatientId] = useState('');
  const [outcome, setOutcome] = useState<ChwVisit['outcome']>('visited');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [p, v] = await Promise.all([getChwPatients(), getChwVisits()]);
    setPatients(p);
    setVisits(v);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return;
    setSubmitting(true);
    await logChwVisit(patientId, outcome, notes);
    setPatientId('');
    setNotes('');
    setOutcome('visited');
    await refresh();
    setSubmitting(false);
  }

  if (loading) return <div className="text-body">Loading visit log…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Visit Log</h1>
        <p className="text-body">Record home visits made to patients in the adherence program.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Patient
            <select required value={patientId} onChange={(e) => setPatientId(e.target.value)} className="rounded border border-border bg-bg px-3 py-2 text-base font-normal text-ink">
              <option value="">Select a patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Outcome
            <select value={outcome} onChange={(e) => setOutcome(e.target.value as ChwVisit['outcome'])} className="rounded border border-border bg-bg px-3 py-2 text-base font-normal text-ink">
              <option value="visited">Visited</option>
              <option value="unreachable">Unreachable</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="rounded border border-border bg-bg p-3 text-base font-normal text-ink" />
        </label>
        <button type="submit" disabled={submitting} className="w-fit rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50">
          {submitting ? 'Logging…' : 'Log Visit'}
        </button>
      </form>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <ClipboardList size={16} className="text-navy" />
          <h3 className="font-bold text-ink">Recent Visits</h3>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {visits.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-body">No visits logged yet.</p>
          ) : (
            visits.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{v.patientName}</p>
                  <p className="text-xs text-body">{v.notes || 'No notes'}</p>
                  <p className="text-xs text-body">Logged by {v.loggedByName}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${outcomeStyles[v.outcome]}`}>{v.outcome}</span>
                  <p className="mt-1 text-xs text-body">{new Date(v.visitedAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
