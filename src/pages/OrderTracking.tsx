import { useEffect, useState } from 'react';
import { Truck, CheckCircle2, Clock } from 'lucide-react';
import { getShipments, type Shipment } from '../services/supabasePharmacyLogisticsService';

// Matches "Stock Tracking: Cold Chain Network" shipment overview.
// Logistics map replaced with a shipment list, same reasoning as other
// map screens (no real GPS feed in this pilot). Real data as of migration
// 0017 (shipments table) -- previously a hardcoded array.
const statusStyles: Record<string, string> = {
  in_transit: 'bg-[#d7e2ff] text-navy',
  delivered: 'bg-success-bg text-success-text',
  delayed: 'bg-danger-bg text-danger-text',
};

const statusLabels: Record<string, string> = { in_transit: 'In Transit', delivered: 'Delivered', delayed: 'Delayed' };

export default function OrderTracking() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShipments().then(setShipments).finally(() => setLoading(false));
  }, []);

  const delivered = shipments.filter((s) => s.status === 'delivered').length;
  const onTimePct = shipments.length ? Math.round((delivered / shipments.length) * 100) : 0;
  const delayed = shipments.filter((s) => s.status === 'delayed').length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Order Tracking &amp; Logistics</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><Truck size={15} /><p className="text-xs font-semibold uppercase">Total Shipments</p></div><p className="mt-1 text-3xl font-bold text-ink">{shipments.length}</p></div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><CheckCircle2 size={15} className="text-success" /><p className="text-xs font-semibold uppercase">Delivered</p></div><p className="mt-1 text-3xl font-bold text-success-text">{onTimePct}%</p></div>
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5"><div className="flex items-center gap-2 text-danger-text"><Clock size={15} /><p className="text-xs font-semibold uppercase">Active Delays</p></div><p className="mt-1 text-3xl font-bold text-danger-text">{delayed}</p></div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Shipment Details</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Shipment</th><th className="px-5 py-3">Route</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">ETA</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-body">Loading…</td></tr>}
              {!loading && shipments.length === 0 && <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-body">No shipments recorded yet.</td></tr>}
              {shipments.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-ink">{s.reference}</td>
                  <td className="px-5 py-3 text-sm text-body">{s.route}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[s.status] ?? 'bg-bg text-body'}`}>{statusLabels[s.status] ?? s.status}</span></td>
                  <td className="px-5 py-3 text-right text-sm text-body">{s.eta ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
