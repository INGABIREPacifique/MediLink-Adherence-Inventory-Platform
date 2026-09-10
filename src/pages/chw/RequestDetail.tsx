import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Package, Phone } from 'lucide-react';
import { getReplenishmentRequestById, type ReplenishmentRequestRow } from '../../services/supabasePharmacyLogisticsService';

// The missing screen identified in the Figma audit: a single request's
// detailed tracking view (matches "Request #REQ-9021" with a status
// timeline and shipment contents), distinct from the list view in
// RequestStatusTracker.tsx.
//
// Real data via getReplenishmentRequestById. The timeline below is built
// honestly from what's actually tracked (submitted_at, status,
// reviewed_at) -- the schema doesn't have separate dispatched_at/
// arrived_at columns, so intermediate steps show as reached/not-reached
// based on real status transitions rather than inventing exact
// timestamps for stages this project doesn't record yet.
const STEPS = [
  { key: 'submitted', label: 'Request Submitted' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
] as const;

function stepIndexForStatus(status: string, reviewedAt: string | null): number {
  if (status === 'delivered') return 3;
  if (status === 'in_transit') return 2;
  if (reviewedAt) return 1;
  return 0;
}

const statusLabel: Record<string, string> = {
  pending_approval: 'Pending Approval',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

export default function RequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState<ReplenishmentRequestRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;
    getReplenishmentRequestById(requestId).then((r) => {
      setRequest(r);
      setLoading(false);
    });
  }, [requestId]);

  if (loading) return <p className="text-body">Loading…</p>;
  if (!request) return <p className="text-body">Request not found.</p>;

  const currentStep = request.status === 'rejected' ? -1 : stepIndexForStatus(request.status, request.reviewedAt);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/chw/request-status" className="flex w-fit items-center gap-2 text-sm font-semibold text-navy-light">
        <ArrowLeft size={15} /> Back to Requests
      </Link>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-body">Request</p>
            <h1 className="text-2xl font-bold text-ink">{request.reference}</h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'rejected' ? 'bg-danger-bg text-danger-text' : request.status === 'delivered' ? 'bg-success-bg text-success-text' : 'bg-[#d7e2ff] text-navy'}`}>
            {statusLabel[request.status] ?? request.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-body">Submitted {new Date(request.submittedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      {request.status === 'rejected' ? (
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5">
          <p className="font-bold text-danger-text">Request Rejected</p>
          <p className="mt-1 text-sm text-danger-text">This request was reviewed and rejected{request.reviewedAt ? ` on ${new Date(request.reviewedAt).toLocaleDateString()}` : ''}.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-ink">Tracking</h3>
          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => {
              const reached = i <= currentStep;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  {reached ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" /> : <Circle size={18} className="mt-0.5 shrink-0 text-border" />}
                  <div>
                    <p className={`text-sm font-semibold ${reached ? 'text-ink' : 'text-body'}`}>{step.label}</p>
                    {step.key === 'submitted' && <p className="text-xs text-body">{new Date(request.submittedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                    {step.key === 'reviewed' && request.reviewedAt && <p className="text-xs text-body">{new Date(request.reviewedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-ink"><Package size={16} /> Shipment Contents</h3>
        <div className="flex flex-col gap-2">
          {request.items.map((item) => (
            <div key={item.itemName} className="flex items-center justify-between rounded border border-border bg-bg px-3 py-2">
              <span className="text-sm font-semibold text-ink">{item.itemName}</span>
              <span className="text-sm text-body">{item.quantity} {item.unit ?? ''}</span>
            </div>
          ))}
        </div>
        {request.note && (
          <div className="mt-3 rounded border border-border bg-bg p-3 text-sm text-body">
            <span className="font-semibold text-ink">Note: </span>{request.note}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-navy p-5 text-white">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold"><Phone size={14} /> Need Help?</p>
        <p className="mb-3 text-xs text-white/80">Contact the District Medical Store for questions about this request.</p>
        <button disabled title="Real support contact routing isn't wired yet" className="w-full cursor-not-allowed rounded bg-white/30 py-2 text-xs font-semibold text-white/60">Call Support</button>
      </div>
    </div>
  );
}
