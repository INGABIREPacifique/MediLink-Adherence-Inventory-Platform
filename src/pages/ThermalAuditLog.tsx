import { useEffect, useState } from 'react';
import { Thermometer, ShieldCheck } from 'lucide-react';
import { getColdChainReadings, type ColdChainReading } from '../services/supabasePharmacyLogisticsService';

// Matches "Thermal Audit Log". Shares the cold_chain_readings table with
// Cold Chain Monitor -- both screens are the same underlying concept
// (a temperature reading against a threshold), just different framing
// (live monitoring vs. audit trail), per migration 0017's design.
export default function ThermalAuditLog() {
  const [entries, setEntries] = useState<ColdChainReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getColdChainReadings().then(setEntries).finally(() => setLoading(false));
  }, []);

  const passed = entries.filter((e) => e.withinRange).length;
  const passRate = entries.length ? Math.round((passed / entries.length) * 100) : 100;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Thermal Audit Log</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><ShieldCheck size={15} className="text-success" /><p className="text-xs font-semibold uppercase">Entries Logged</p></div><p className="mt-1 text-3xl font-bold text-success-text">{entries.length}</p></div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><Thermometer size={15} /><p className="text-xs font-semibold uppercase">Pass Rate</p></div><p className="mt-1 text-3xl font-bold text-ink">{passRate}%</p></div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Recent Entries</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Batch / Route</th><th className="px-5 py-3">Reading</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Logged</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-body">Loading…</td></tr>}
              {!loading && entries.length === 0 && <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-body">No entries logged yet.</td></tr>}
              {entries.map((e) => (
                <tr key={e.id} className={`border-b border-border last:border-0 ${!e.withinRange ? 'bg-danger-bg/30' : ''}`}>
                  <td className="px-5 py-3 text-sm font-semibold text-ink">{e.label}</td>
                  <td className="px-5 py-3 text-sm text-body">{e.temperatureCelsius}°C</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${e.withinRange ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'}`}>{e.withinRange ? 'Passed' : 'Excursion Detected'}</span></td>
                  <td className="px-5 py-3 text-right text-sm text-body">{new Date(e.recordedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
