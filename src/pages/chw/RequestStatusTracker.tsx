import { Package, Clock, CheckCircle2, Truck } from 'lucide-react';

// Matches Figma node 1:7387 "CHW Field App - Request Status Tracker" --
// tracks requests submitted via ReplenishmentRequest.tsx through to
// delivery. FRONTEND ONLY -- mock request list.
const REQUESTS = [
  { id: 'REQ-3311', items: 'Amoxicillin 500mg ×20, ORS ×15', status: 'Delivered', updated: '2 days ago' },
  { id: 'REQ-3327', items: 'Insulin (vials) ×10', status: 'In Transit', updated: '4 hours ago' },
  { id: 'REQ-3331', items: 'Paracetamol 500mg ×30', status: 'Pending Approval', updated: '20 minutes ago' },
];

const statusConfig: Record<string, { icon: typeof Clock; className: string }> = {
  'Pending Approval': { icon: Clock, className: 'bg-warning-bg text-warning-text' },
  'In Transit': { icon: Truck, className: 'bg-[#d7e2ff] text-navy' },
  Delivered: { icon: CheckCircle2, className: 'bg-success-bg text-success-text' },
};

export default function RequestStatusTracker() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Request Status Tracker</h1>
        <p className="text-body">Track your submitted replenishment requests.</p>
      </div>

      <div className="flex flex-col gap-3">
        {REQUESTS.map((r) => {
          const { icon: Icon, className } = statusConfig[r.status];
          return (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy"><Package size={17} /></span>
                <div>
                  <p className="font-semibold text-ink">{r.id}</p>
                  <p className="text-sm text-body">{r.items}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
                  <Icon size={12} /> {r.status}
                </span>
                <span className="text-xs text-body">Updated {r.updated}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
