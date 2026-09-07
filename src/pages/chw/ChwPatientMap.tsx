import { MapPin, Navigation, Phone } from 'lucide-react';

// Matches Figma node 1:2164 "CHW Field App - Patient Map". Per the same
// reasoning already applied to Order Tracking / Cold Chain / Supply Chain
// Correlation screens elsewhere in this project: this pilot's database has
// no facility/patient geolocation data, so a real interactive map would be
// fabricated. Built as a priority-sorted list instead -- same information
// (who's critical, who's nearby, get-directions action) without faking a
// map pin position that doesn't come from real coordinates.
// FRONTEND ONLY -- mock patient list.
const PATIENTS = [
  { name: 'Marie Uwase', priority: 'Critical' as const, distance: '0.4 km', eta: '6 min', reason: '3 consecutive missed doses' },
  { name: 'Jean Bosco Nkurunziza', priority: 'Standard' as const, distance: '1.1 km', eta: '15 min', reason: 'Routine follow-up due today' },
  { name: 'Chantal Iribagiza', priority: 'Standard' as const, distance: '2.3 km', eta: '28 min', reason: 'Monthly check-in' },
];

const priorityStyles: Record<string, string> = {
  Critical: 'bg-danger-bg text-danger-text border-danger/30',
  Standard: 'bg-[#d7e2ff] text-navy border-navy/20',
};

export default function ChwPatientMap() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Nearby Patients</h1>
        <p className="text-body">Sorted by priority — no live GPS in this pilot, so distance/ETA are illustrative until a mapping provider is integrated.</p>
      </div>

      <div className="flex flex-col gap-3">
        {PATIENTS.map((p) => (
          <div key={p.name} className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-bg text-body"><MapPin size={17} /></span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{p.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[p.priority]}`}>{p.priority}</span>
                  </div>
                  <p className="text-sm text-body">{p.reason}</p>
                </div>
              </div>
              <div className="text-right text-xs text-body">
                <p className="font-semibold text-ink">{p.distance}</p>
                <p>Est. {p.eta}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled
                title="Real turn-by-turn directions need a mapping provider (e.g. Google Maps API) — not wired yet"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white opacity-50"
              >
                <Navigation size={13} /> Get Directions
              </button>
              <button type="button" className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-body">
                <Phone size={13} /> Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
