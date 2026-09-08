import { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, Users, Download } from 'lucide-react';
import { getMinistryDashboardSummary, type MinistryDashboardSummary } from '../../services/supabaseMinistryService';

// Matches Figma "Health Authority Analytics / District Analytics" content.
// Real data as of migrations 0018-0019 -- but honestly pilot-wide, not a
// true district breakdown, since patients/inventory aren't yet linked to
// a specific facility_id. The District Facility Performance MAP from
// Figma is still deliberately not built -- no facility geolocation data
// exists in this pilot's schema (same reasoning as the Supervisor
// Dashboard).
export default function MinistryDashboard() {
  const [summary, setSummary] = useState<MinistryDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMinistryDashboardSummary().then(setSummary).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Pilot Analytics</h1>
          <p className="text-body">Kigali Central Hospital Pilot — Performance Overview</p>
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
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : `${summary?.adherenceRatePct}%`}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-body">Critical Stockouts</p>
            <AlertTriangle size={15} className="text-danger" />
          </div>
          <p className="mt-1 text-3xl font-bold text-danger">{loading ? '—' : summary?.criticalStockouts}</p>
          <p className="text-xs text-body">Items at critical status</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-body">Active CHWs</p>
            <Users size={15} className="text-navy" />
          </div>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : summary?.activeChwCount}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-bold text-ink">Attention Required</h3>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {loading && <p className="px-5 py-4 text-sm text-body">Loading…</p>}
          {!loading && (summary?.attentionItems.length ?? 0) === 0 && <p className="px-5 py-4 text-sm text-body">Nothing needs attention right now.</p>}
          {summary?.attentionItems.map((item) => (
            <div key={item.title} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="text-xs text-body">{item.issue}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.level === 'critical' ? 'bg-danger-bg text-danger-text' : 'bg-warning-bg text-warning-text'}`}>
                {item.level === 'critical' ? 'Critical' : 'Warning'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
