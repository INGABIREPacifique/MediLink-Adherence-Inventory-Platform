import { useEffect, useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import { supabaseAlertsService } from '../../services/supabaseAlertsService';
import type { EscalationAlert } from '../../types';

// Matches Figma node 1:2164 "CHW Field App - Patient Map". Per the same
// reasoning already applied to Order Tracking / Cold Chain / Supply Chain
// Correlation screens elsewhere in this project: this pilot's database has
// no facility/patient geolocation data, so a real interactive map would be
// fabricated. Built as a priority-sorted list instead -- real pending
// escalations (migration 0001), sorted by AI priority. Distance/ETA are
// honestly dropped rather than faked, since there's no real location data
// to compute them from -- a "Get Directions" button stays disabled for
// the same reason.
const priorityStyles: Record<string, string> = {
  critical: 'bg-danger-bg text-danger-text border-danger/30',
  high: 'bg-warning-bg text-warning-text border-warning/30',
  medium: 'bg-[#d7e2ff] text-navy border-navy/20',
  low: 'bg-bg text-body border-border',
};

export default function ChwPatientMap() {
  const [alerts, setAlerts] = useState<EscalationAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseAlertsService.getAlerts().then((all) => {
      setAlerts(all.filter((a) => a.status === 'pending'));
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Nearby Patients</h1>
        <p className="text-body">Sorted by escalation priority — no live GPS in this pilot, so distances aren't shown rather than faked.</p>
      </div>

      <div className="flex flex-col gap-3">
        {loading && <p className="text-sm text-body">Loading…</p>}
        {!loading && alerts.length === 0 && <p className="text-sm text-body">No pending escalations right now.</p>}
        {alerts.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-bg text-body"><MapPin size={17} /></span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{a.patient.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[a.aiPriority ?? 'medium']}`}>{a.aiPriority ?? 'Standard'}</span>
                  </div>
                  <p className="text-sm text-body">{a.medication} — {a.phase || 'Missed dose'}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled
                title="Real turn-by-turn directions need a mapping provider (e.g. Google Maps API) — not wired yet"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white opacity-50"
              >
                <MapPin size={13} /> Get Directions
              </button>
              <a href={`tel:${a.patient.phone}`} className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-body">
                <Phone size={13} /> Call
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
