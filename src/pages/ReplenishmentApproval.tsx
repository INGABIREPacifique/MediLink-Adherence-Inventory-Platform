import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getReplenishmentRequests, reviewReplenishmentRequest, type ReplenishmentRequestRow } from '../services/supabasePharmacyLogisticsService';

// Matches "Replenishment Approval". Real data as of migration 0017
// (replenishment_requests + replenishment_request_items) -- previously
// every action here was honestly disabled since no backend existed to
// approve against. Approve/Reject now write real status updates.
const priorityStyles: Record<string, string> = {
  urgent: 'bg-danger-bg text-danger-text',
  routine: 'bg-row-alt text-body',
};

export default function ReplenishmentApproval() {
  const [requests, setRequests] = useState<ReplenishmentRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getReplenishmentRequests().then((r) => {
      setRequests(r.filter((req) => req.status === 'pending_approval'));
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function decide(id: string, decision: 'in_transit' | 'rejected') {
    setActingOn(id);
    await reviewReplenishmentRequest(id, decision);
    load();
    setActingOn(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold text-ink">Replenishment Approval</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Pending Requests</p><p className="text-2xl font-bold text-ink">{requests.length}</p></div>
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5"><p className="text-xs font-semibold uppercase text-danger-text">Urgent</p><p className="text-2xl font-bold text-danger-text">{requests.filter((r) => r.urgency === 'urgent').length}</p></div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Pending Requests</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Reference</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3 text-right">Action</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-body">Loading…</td></tr>}
              {!loading && requests.length === 0 && <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-body">No requests awaiting approval.</td></tr>}
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-ink">{r.reference}</td>
                  <td className="px-5 py-3 text-sm text-body">{r.items.map((i) => `${i.itemName} ×${i.quantity}`).join(', ')}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${priorityStyles[r.urgency] ?? priorityStyles.routine}`}>{r.urgency}</span></td>
                  <td className="px-5 py-3 text-sm text-body">{new Date(r.submittedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button disabled={actingOn === r.id} onClick={() => decide(r.id, 'rejected')} className="rounded border border-border px-3 py-1.5 text-xs font-semibold text-body disabled:opacity-50">Reject</button>
                      <button disabled={actingOn === r.id} onClick={() => decide(r.id, 'in_transit')} className="rounded bg-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Approve</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {requests.some((r) => r.note) && (
        <p className="flex items-center gap-1.5 text-xs text-body"><AlertTriangle size={12} /> Some requests include a note from the requester — check the request details before approving.</p>
      )}
    </div>
  );
}
