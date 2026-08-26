import { TrendingUp, AlertTriangle, Users, Download } from 'lucide-react';

// Matches Figma "Health Authority Analytics / District Analytics" content.
// FRONTEND ONLY -- mock data. The District Facility Performance MAP from
// Figma is deliberately not built -- no facility geolocation data exists
// in this pilot's schema (same reasoning as the Supervisor Dashboard).
const attentionItems = [
  { facility: 'Remera Health Center', issue: 'ARV Stock < 5 days', level: 'critical' },
  { facility: 'Kacyiru Hospital', issue: 'Adherence drop (-4%)', level: 'warning' },
  { facility: 'Kimironko Clinic', issue: 'High CHW escalation rate', level: 'warning' },
];

export default function MinistryDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">District Analytics</h1>
          <p className="text-body">Gasabo District Performance &amp; Benchmarking</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
          <Download size={15} />
          Monthly Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-body">Overall Adherence</p>
            <TrendingUp size={15} className="text-success" />
          </div>
          <p className="mt-1 text-3xl font-bold text-ink">92.4%</p>
          <p className="text-xs text-success-text">↑ +1.2% from last month</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-body">Critical Stockouts</p>
            <AlertTriangle size={15} className="text-danger" />
          </div>
          <p className="mt-1 text-3xl font-bold text-danger">3</p>
          <p className="text-xs text-body">Facilities affected</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-body">Active CHWs</p>
            <Users size={15} className="text-navy" />
          </div>
          <p className="mt-1 text-3xl font-bold text-ink">1,402</p>
          <p className="text-xs text-body">↑ 98% reporting rate</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-bold text-ink">Attention Required</h3>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {attentionItems.map((item) => (
            <div key={item.facility} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">{item.facility}</p>
                <p className="text-xs text-body">{item.issue}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.level === 'critical' ? 'bg-danger-bg text-danger-text' : 'bg-warning-bg text-warning-text'}`}>
                {item.level === 'critical' ? 'Critical' : 'Warning'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-1 font-bold text-ink">Medication Consumption Trends</h3>
        <p className="mb-4 text-xs text-body">Aggregated across 12 facilities in Gasabo</p>
        <div className="flex h-40 items-end gap-2">
          {[40, 55, 45, 60, 50, 90].map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t bg-navy" style={{ height: `${v}%` }} />
              <span className="text-[10px] text-body">W{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
