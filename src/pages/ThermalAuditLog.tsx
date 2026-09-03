import { Thermometer, ShieldCheck } from 'lucide-react';

// Matches "Thermal Audit Log". FRONTEND ONLY -- mock data.
const entries = [
  { batch: 'Insulin Batch #BX-8903', temp: 4.2, status: 'Passed', time: 'Aug 20, 08:30' },
  { batch: 'OPV Batch #TRK-8924', temp: 8.4, status: 'Excursion Detected', time: 'Aug 20, 06:15' },
  { batch: 'Malaria RDT #MR-001X', temp: 22.1, status: 'Passed', time: 'Aug 19, 14:00' },
];

export default function ThermalAuditLog() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Thermal Audit Log</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><ShieldCheck size={15} className="text-success" /><p className="text-xs font-semibold uppercase">Compliance Rate</p></div><p className="mt-1 text-3xl font-bold text-success-text">94%</p></div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-body"><Thermometer size={15} /><p className="text-xs font-semibold uppercase">Pass Rate (30 days)</p></div><p className="mt-1 text-3xl font-bold text-ink">98.5%</p></div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Recent Entries</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Batch</th><th className="px-5 py-3">Reading</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Logged</th></tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.batch} className={`border-b border-border last:border-0 ${e.status !== 'Passed' ? 'bg-danger-bg/30' : ''}`}>
                  <td className="px-5 py-3 text-sm font-semibold text-ink">{e.batch}</td>
                  <td className="px-5 py-3 text-sm text-body">{e.temp}°C</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${e.status === 'Passed' ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'}`}>{e.status}</span></td>
                  <td className="px-5 py-3 text-right text-sm text-body">{e.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
