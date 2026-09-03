import { Truck, CheckCircle2, Clock } from 'lucide-react';

// Matches "Stock Tracking: Cold Chain Network" shipment overview.
// FRONTEND ONLY -- logistics map replaced with a shipment list, same
// reasoning as other map screens (no real GPS feed in this pilot).
const shipments = [
  { id: 'SHP-4821', route: 'Kigali Central → Musanze', status: 'In Transit', eta: '2h 15m' },
  { id: 'SHP-4809', route: 'Kigali Central → Nyagatare', status: 'Delivered', eta: 'Completed' },
  { id: 'SHP-4790', route: 'Musanze → Health Post 4', status: 'Delayed', eta: '4h 30m' },
];

const statusStyles: Record<string, string> = {
  'In Transit': 'bg-[#d7e2ff] text-navy',
  Delivered: 'bg-success-bg text-success-text',
  Delayed: 'bg-danger-bg text-danger-text',
};

export default function OrderTracking() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Order Tracking &amp; Logistics</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><Truck size={15} /><p className="text-xs font-semibold uppercase">Total Shipments</p></div><p className="mt-1 text-3xl font-bold text-ink">14</p></div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><CheckCircle2 size={15} className="text-success" /><p className="text-xs font-semibold uppercase">On-Time Delivery</p></div><p className="mt-1 text-3xl font-bold text-success-text">92%</p></div>
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5"><div className="flex items-center gap-2 text-danger-text"><Clock size={15} /><p className="text-xs font-semibold uppercase">Active Delays</p></div><p className="mt-1 text-3xl font-bold text-danger-text">2</p></div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Shipment Details</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Shipment</th><th className="px-5 py-3">Route</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">ETA</th></tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-ink">{s.id}</td>
                  <td className="px-5 py-3 text-sm text-body">{s.route}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[s.status]}`}>{s.status}</span></td>
                  <td className="px-5 py-3 text-right text-sm text-body">{s.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
