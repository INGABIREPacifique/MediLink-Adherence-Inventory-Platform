import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, History } from 'lucide-react';
import { getChwPatients, type ChwPatient } from '../../services/supabaseChwService';

// Matches Figma node 1:2293 "CHW Field App - Patient Registry" content.
// Scoped by patients.assigned_chw_id -- see getChwPatients in
// supabaseChwService.ts for how unassigned vs assigned patients are shown.
export default function ChwPatients() {
  const [patients, setPatients] = useState<ChwPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChwPatients().then((p) => {
      setPatients(p);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-body">Loading patients…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">My Patients</h1>
        <p className="text-body">Patients enrolled in the post-discharge adherence program.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
            <tr>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Enrolled</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr key={p.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                <td className="px-6 py-3 text-sm font-semibold text-ink">{p.name}</td>
                <td className="px-6 py-3 text-sm text-body">{p.phone}</td>
                <td className="px-6 py-3 text-sm text-body">{new Date(p.enrolledAt).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link to={`/patients/${p.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-light">
                      <History size={13} />
                      History
                    </Link>
                    <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-light">
                      <Phone size={13} />
                      Call
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
