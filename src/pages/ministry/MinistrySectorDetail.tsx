import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { getSectorDetailStats, type SectorDetailStats } from '../../services/supabaseMinistryService';

// Matches "Sector A: Detailed Report" from screenshot. Real data as of
// migrations 0018-0019, but honestly pilot-wide -- same reasoning as
// Sector Reports: no sector-specific split is possible without
// patient-facility linkage. The CHW leaderboard IS real per-CHW data
// (chw_visits.logged_by), since that doesn't need sector linkage.
export default function MinistrySectorDetail() {
  const [stats, setStats] = useState<SectorDetailStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSectorDetailStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const latestRate = stats?.adherenceTrend[stats.adherenceTrend.length - 1] ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Pilot Detailed Report</h1>
        <p className="text-body">Deep-dive into performance metrics and CHW outcomes. Pilot-wide (sector-level split needs patient-facility linkage, not yet in schema).</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Adherence Rate (Today)</p><p className="text-2xl font-bold text-success-text">{loading ? '—' : `${latestRate}%`} <TrendingUp size={13} className="inline text-success" /></p></div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Active CHWs (Leaderboard)</p><p className="text-2xl font-bold text-ink">{loading ? '—' : stats?.chwLeaderboard.length}</p></div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Total Patients Tracked</p><p className="text-2xl font-bold text-ink">{loading ? '—' : stats?.totalPatients}</p></div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-ink">Adherence Trend (Last 7 Days)</h3>
          <div className="flex h-40 items-end gap-2">
            {(stats?.adherenceTrend ?? []).map((v, i) => (
              <div key={i} className="flex-1 rounded-t bg-navy" style={{ height: `${v}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-2 font-bold text-ink">Patients Tracked</h3>
          <div className="flex items-center justify-center">
            <div className="flex size-28 items-center justify-center rounded-full border-8 border-success">
              <span className="text-2xl font-bold text-ink">{loading ? '—' : stats?.totalPatients}</span>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-body">Total patients enrolled</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">CHW Leaderboard: Visits Logged</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">CHW</th><th className="px-5 py-3">Visits</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={2} className="px-5 py-6 text-center text-sm text-body">Loading…</td></tr>}
              {!loading && (stats?.chwLeaderboard.length ?? 0) === 0 && <tr><td colSpan={2} className="px-5 py-6 text-center text-sm text-body">No visits logged yet.</td></tr>}
              {stats?.chwLeaderboard.map((c) => (
                <tr key={c.name} className="border-b border-border last:border-0"><td className="px-5 py-3 text-sm font-semibold text-ink">{c.name}</td><td className="px-5 py-3 text-sm text-body">{c.visitCount}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
