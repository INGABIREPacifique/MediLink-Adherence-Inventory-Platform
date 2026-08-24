import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPatients, type PatientSummary } from '../services/supabasePatientHistoryService';

// Was a real gap: nurses had no way to browse patients at all -- only the
// CHW role had a patient list. This gives nurse/admin the same entry point
// into per-patient adherence history (PatientHistory.tsx).
export default function PatientDirectory() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPatients().then((p) => {
      setPatients(p);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-body">Loading patients…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Patient Directory</h1>
        <p className="text-body">All patients enrolled in the post-discharge adherence program.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
            <tr>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Adherence Rate</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr key={p.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                <td className="px-6 py-3 text-sm font-semibold text-ink">{p.name}</td>
                <td className="px-6 py-3 text-sm text-body">{p.phone}</td>
                <td className="px-6 py-3 text-sm text-body">
                  {p.dosesTaken + p.dosesMissed === 0 ? 'No doses yet' : `${p.adherenceRatePct}% (${p.dosesTaken}/${p.dosesTaken + p.dosesMissed})`}
                </td>
                <td className="px-6 py-3 text-right">
                  <Link to={`/patients/${p.id}`} className="text-sm font-semibold text-navy-light">View History</Link>
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
