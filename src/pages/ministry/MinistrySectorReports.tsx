import { Download, FileText, FileSpreadsheet, Send } from 'lucide-react';

// Matches Figma "Sector Performance Reports" content. FRONTEND ONLY --
// mock data. The Figma design's District Heatmap (an actual geo map) is
// replaced with a simple ranked list here -- same reasoning as other
// map-dependent screens: no facility/sector geolocation data exists in
// this pilot's schema, and this batch is meant to look real, not fabricate
// coordinates. A ranked bar list conveys the same "which sectors need
// attention" information honestly.
const sectors = [
  { name: 'Kicukiro', status: 'Top Performer', statusColor: 'bg-success-bg text-success-text', rate: 94.2, trend: '+2.1%', patients: 12450, chw: 98.5 },
  { name: 'Gasabo', status: 'Stable', statusColor: 'bg-row-alt text-body', rate: 87.5, trend: '-0.4%', patients: 24102, chw: 91.2 },
  { name: 'Nyarugenge', status: 'Attention Needed', statusColor: 'bg-warning-bg text-warning-text', rate: 78.1, trend: '-4.5%', patients: 18660, chw: 82.4 },
  { name: 'Gatsibo', status: 'Critical', statusColor: 'bg-danger-bg text-danger-text', rate: 62.8, trend: '-12.0%', patients: 9240, chw: 64.1 },
];

export default function MinistrySectorReports() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Sector Performance Reports</h1>
          <p className="text-body">Last 30 days</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
          <Download size={15} />
          Export District Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sectors.map((s) => (
          <div key={s.name} className={`rounded-lg border p-4 shadow-sm ${s.status === 'Critical' ? 'border-danger' : 'border-border bg-white'}`}>
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink">{s.name}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.statusColor}`}>{s.status}</span>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase text-body">Adherence Rate</p>
            <p className={`text-2xl font-bold ${s.rate >= 90 ? 'text-success-text' : s.rate >= 70 ? 'text-ink' : 'text-danger'}`}>{s.rate}% <span className="text-xs font-normal">{s.trend}</span></p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-body">Active Patients</p><p className="font-semibold text-ink">{s.patients.toLocaleString()}</p></div>
              <div><p className="text-body">CHW Completion</p><p className="font-semibold text-ink">{s.chw}%</p></div>
            </div>
            <button className={`mt-3 w-full rounded py-1.5 text-xs font-semibold ${s.status === 'Critical' ? 'bg-danger text-white' : 'border border-border text-body'}`}>
              {s.status === 'Critical' ? 'Urgent Intervention' : 'View Detailed Report'}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="font-bold text-ink">Medication Adherence Comparison</h3>
          <p className="mb-4 text-xs text-body">Top-performing vs. under-performing sectors</p>
          <div className="flex h-40 items-end gap-3">
            {sectors.map((s) => (
              <div key={s.name} className="flex flex-1 flex-col items-center gap-1">
                <div className={`w-full rounded-t ${s.rate >= 90 ? 'bg-success' : s.rate >= 70 ? 'bg-warning-text' : 'bg-danger'}`} style={{ height: `${s.rate}%` }} />
                <span className="text-[10px] text-body">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <h4 className="mb-2 text-sm font-bold text-ink">Export Sector Data</h4>
            <button className="mb-2 flex w-full items-center gap-2 rounded border border-border px-3 py-2 text-sm text-body"><FileText size={14} />Download PDF Report</button>
            <button className="flex w-full items-center gap-2 rounded border border-border px-3 py-2 text-sm text-body"><FileSpreadsheet size={14} />Export to CSV/Excel</button>
          </div>
          <div className="rounded-lg bg-navy p-4 text-white">
            <h4 className="mb-1 flex items-center gap-2 text-sm font-bold"><Send size={14} />Schedule Report</h4>
            <p className="mb-3 text-xs text-white/80">Automatically receive this district performance digest every Monday at 8:00 AM.</p>
            <button className="w-full rounded bg-white py-1.5 text-xs font-semibold text-navy">Configure Recurring Sync</button>
          </div>
        </div>
      </div>
    </div>
  );
}
