import { useEffect, useState } from 'react';
import { Phone, Footprints } from 'lucide-react';
import { getAuditLog, type AuditEntry } from '../services/supabaseAuditService';

// Backs the "Audit Log" button on Escalation Rules Config, which
// previously went nowhere. Real combined trail of follow-up calls and
// CHW visits -- both actions were already being recorded, just never
// surfaced anywhere as a unified log.
export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLog().then((e) => {
      setEntries(e);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-body">Loading audit log…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Audit Log</h1>
        <p className="text-body">A combined trail of every follow-up call and home visit logged in the system.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        {entries.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-body">Nothing logged yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {entries.map((e) => (
              <div key={e.id} className="flex gap-3 px-6 py-4">
                <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${e.type === 'follow_up' ? 'bg-navy' : 'bg-success'} text-white`}>
                  {e.type === 'follow_up' ? <Phone size={14} /> : <Footprints size={14} />}
                </span>
                <div>
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{e.actor}</span> -- {e.summary} for <span className="font-semibold">{e.patientName}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-body">{new Date(e.at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
