import { Radio, ShieldCheck, AlertTriangle } from 'lucide-react';

// Matches "Cold Chain Integrity Monitor". FRONTEND ONLY -- mock data.
// Live Thermal Routing map replaced with a shipment status list, same
// reasoning as every other map screen: no real sensor/GPS hardware feed
// exists in this pilot.
const shipments = [
  { id: 'Kigali → Musanze', temp: 4.2, status: 'On Target', ok: true },
  { id: 'Kigali → Nyagatare', temp: 8.4, status: 'Alert: Above Threshold', ok: false },
  { id: 'Musanze → Health Post 4', temp: 3.8, status: 'On Target', ok: true },
];

export default function ColdChainMonitor() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Cold Chain Integrity Monitor</h1>
      <p className="-mt-4 text-body">4 active sensors · Last synced just now.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><Radio size={15} /><p className="text-xs font-semibold uppercase">Active Sensors</p></div><p className="mt-1 text-3xl font-bold text-ink">42</p></div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><ShieldCheck size={15} className="text-success" /><p className="text-xs font-semibold uppercase">Compliance Rate</p></div><p className="mt-1 text-3xl font-bold text-success-text">98.4%</p></div>
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5"><div className="flex items-center gap-2 text-danger-text"><AlertTriangle size={15} /><p className="text-xs font-semibold uppercase">Active Alerts</p></div><p className="mt-1 text-3xl font-bold text-danger-text">2</p></div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Live Shipments</h3></div>
        <div className="flex flex-col divide-y divide-border">
          {shipments.map((s) => (
            <div key={s.id} className={`flex items-center justify-between px-5 py-4 ${!s.ok ? 'bg-danger-bg/30' : ''}`}>
              <div>
                <p className="text-sm font-semibold text-ink">{s.id}</p>
                <p className={`text-xs font-semibold ${s.ok ? 'text-success-text' : 'text-danger-text'}`}>{s.status}</p>
              </div>
              <p className={`text-2xl font-bold ${s.ok ? 'text-ink' : 'text-danger'}`}>{s.temp}°C</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
