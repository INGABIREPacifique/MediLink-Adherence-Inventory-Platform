import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2, Truck } from 'lucide-react';
import { getReplenishmentRequests, type ReplenishmentRequestRow } from '../../services/supabasePharmacyLogisticsService';

// Matches Figma node 1:7387 "CHW Field App - Request Status Tracker" --
// tracks requests submitted via ReplenishmentRequest.tsx through to
// delivery. Real data as of migration 0017.
const statusConfig: Record<string, { icon: typeof Clock; className: string; label: string }> = {
  pending_approval: { icon: Clock, className: 'bg-warning-bg text-warning-text', label: 'Pending Approval' },
  in_transit: { icon: Truck, className: 'bg-[#d7e2ff] text-navy', label: 'In Transit' },
  delivered: { icon: CheckCircle2, className: 'bg-success-bg text-success-text', label: 'Delivered' },
  rejected: { icon: Clock, className: 'bg-danger-bg text-danger-text', label: 'Rejected' },
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  return `${Math.round(hours / 24)} day${Math.round(hours / 24) === 1 ? '' : 's'} ago`;
}

export default function RequestStatusTracker() {
  const [requests, setRequests] = useState<ReplenishmentRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReplenishmentRequests().then(setRequests).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Request Status Tracker</h1>
        <p className="text-body">Track your submitted replenishment requests.</p>
      </div>

      <div className="flex flex-col gap-3">
        {loading && <p className="text-sm text-body">Loading…</p>}
        {!loading && requests.length === 0 && <p className="text-sm text-body">No requests submitted yet.</p>}
        {requests.map((r) => {
          const config = statusConfig[r.status] ?? statusConfig.pending_approval;
          const Icon = config.icon;
          return (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy"><Package size={17} /></span>
                <div>
                  <p className="font-semibold text-ink">{r.reference}</p>
                  <p className="text-sm text-body">{r.items.map((i) => `${i.itemName} ×${i.quantity}`).join(', ')}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
                  <Icon size={12} /> {config.label}
                </span>
                <span className="text-xs text-body">Updated {timeAgo(r.submittedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
