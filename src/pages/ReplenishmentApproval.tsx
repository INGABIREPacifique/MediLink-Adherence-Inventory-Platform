import { useState } from 'react';
import { CheckSquare, AlertTriangle, X } from 'lucide-react';

// Matches "Replenishment Approval" + "Modify Replenishment Order" modal.
// FRONTEND ONLY -- Bulk Approve/Deny buttons are decorative; a real
// approval workflow writing to inventory would need careful design
// (who can approve, audit trail), not a button that silently modifies
// stock -- backend phase, flagged not decided silently.
const orders = [
  { facility: 'Kinigi Hospital', item: 'Amoxicillin 500mg', qty: '20,000 units', priority: 'High', eta: 'Aug 22, 2024' },
  { facility: 'Musanze Health Center', item: 'Paracetamol 500mg', qty: '15,000 units', priority: 'Standard', eta: 'Aug 24, 2024' },
  { facility: 'Nyagatare District Hospital', item: 'Malaria RDT Kits', qty: '5,000 units', priority: 'Emergency', eta: 'Aug 20, 2024' },
];

export default function ReplenishmentApproval() {
  const [selected, setSelected] = useState<typeof orders[0] | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold text-ink">Replenishment Approval</h1>
        <button disabled title="Bulk approval backend not built yet" className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-navy/40 px-4 py-2.5 text-sm font-semibold text-white/70">
          <CheckSquare size={15} />
          Bulk Approve (0)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Pending Allocations</p><p className="text-2xl font-bold text-ink">47 <span className="text-sm font-normal text-body">orders</span></p></div>
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5"><p className="text-xs font-semibold uppercase text-danger-text">Active Alerts</p><p className="text-2xl font-bold text-danger-text">12 <span className="text-sm font-normal">flagged</span></p></div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Total Spend Value</p><p className="text-2xl font-bold text-ink">3.2M <span className="text-sm font-normal text-body">RWF</span></p></div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Pending Allocations</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Facility</th><th className="px-5 py-3">Item</th><th className="px-5 py-3">Quantity</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Est. Delivery</th><th className="px-5 py-3 text-right">Action</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.facility} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-ink">{o.facility}</td>
                  <td className="px-5 py-3 text-sm text-body">{o.item}</td>
                  <td className="px-5 py-3 text-sm text-body">{o.qty}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${o.priority === 'Emergency' ? 'bg-danger-bg text-danger-text' : o.priority === 'High' ? 'bg-warning-bg text-warning-text' : 'bg-row-alt text-body'}`}>{o.priority}</span></td>
                  <td className="px-5 py-3 text-sm text-body">{o.eta}</td>
                  <td className="px-5 py-3 text-right"><button onClick={() => setSelected(o)} className="text-sm font-semibold text-navy-light">Modify</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-ink">Modify Replenishment Order</h3>
              <button onClick={() => setSelected(null)}><X size={18} className="text-body" /></button>
            </div>
            <p className="mt-1 text-xs text-body">{selected.facility} · {selected.item}</p>
            <label className="mt-4 flex flex-col gap-1 text-xs font-semibold text-body">Adjustment Quantity<input defaultValue={selected.qty} className="rounded border border-border px-3 py-2 text-sm text-ink" /></label>
            <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-body">Delivery Priority<select defaultValue={selected.priority} className="rounded border border-border px-3 py-2 text-sm text-ink"><option>Standard</option><option>High</option><option>Emergency</option></select></label>
            <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-body">Reason for Modification<textarea rows={2} className="rounded border border-border p-2 text-sm text-ink" /></label>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-warning-text"><AlertTriangle size={12} />Changes require district supervisor sign-off.</div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-body">Cancel</button>
              <button disabled title="Approval backend not built yet" className="cursor-not-allowed rounded-lg bg-navy/40 px-4 py-2 text-sm font-semibold text-white/70">Submit Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
