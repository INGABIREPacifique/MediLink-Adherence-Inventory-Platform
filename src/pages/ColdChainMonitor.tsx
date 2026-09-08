import { useEffect, useState } from 'react';
import { Radio, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getColdChainReadings, type ColdChainReading } from '../services/supabasePharmacyLogisticsService';

// Matches "Cold Chain Integrity Monitor". Live Thermal Routing map
// replaced with a shipment status list, same reasoning as every other map
// screen: no real sensor/GPS hardware feed exists in this pilot. Real
// data as of migration 0017 (cold_chain_readings table).
export default function ColdChainMonitor() {
  const [readings, setReadings] = useState<ColdChainReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getColdChainReadings().then(setReadings).finally(() => setLoading(false));
  }, []);

  const alerts = readings.filter((r) => !r.withinRange).length;
  const compliancePct = readings.length ? Math.round(((readings.length - alerts) / readings.length) * 100) : 100;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Cold Chain Integrity Monitor</h1>
      <p className="-mt-4 text-body">Readings logged during Delivery Receipt intake and shipment tracking.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><Radio size={15} /><p className="text-xs font-semibold uppercase">Readings Logged</p></div><p className="mt-1 text-3xl font-bold text-ink">{readings.length}</p></div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><ShieldCheck size={15} className="text-success" /><p className="text-xs font-semibold uppercase">Compliance Rate</p></div><p className="mt-1 text-3xl font-bold text-success-text">{compliancePct}%</p></div>
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5"><div className="flex items-center gap-2 text-danger-text"><AlertTriangle size={15} /><p className="text-xs font-semibold uppercase">Active Alerts</p></div><p className="mt-1 text-3xl font-bold text-danger-text">{alerts}</p></div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Recent Readings</h3></div>
        <div className="flex flex-col divide-y divide-border">
          {loading && <div className="px-5 py-6 text-center text-sm text-body">Loading…</div>}
          {!loading && readings.length === 0 && <div className="px-5 py-6 text-center text-sm text-body">No readings logged yet.</div>}
          {readings.map((r) => (
            <div key={r.id} className={`flex items-center justify-between px-5 py-4 ${!r.withinRange ? 'bg-danger-bg/30' : ''}`}>
              <div>
                <p className="text-sm font-semibold text-ink">{r.label}</p>
                <p className={`text-xs font-semibold ${r.withinRange ? 'text-success-text' : 'text-danger-text'}`}>{r.withinRange ? 'On Target' : 'Alert: Outside Threshold'}</p>
              </div>
              <p className={`text-2xl font-bold ${r.withinRange ? 'text-ink' : 'text-danger'}`}>{r.temperatureCelsius}°C</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
