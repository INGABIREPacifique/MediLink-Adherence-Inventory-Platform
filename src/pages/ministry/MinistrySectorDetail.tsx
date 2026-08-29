import { TrendingUp } from 'lucide-react';

// Matches "Sector A: Detailed Report" from screenshot. FRONTEND ONLY.
export default function MinistrySectorDetail() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Sector A: Detailed Report</h1>
        <p className="text-body">Deep-dive into performance metrics and clinician outcomes for this sector.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Adherence Rate</p><p className="text-2xl font-bold text-success-text">96% <TrendingUp size={13} className="inline text-success" /></p></div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Active CHWs</p><p className="text-2xl font-bold text-ink">12</p></div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Active Cases</p><p className="text-2xl font-bold text-ink">24</p></div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-body">Avg. Visit Time</p><p className="text-2xl font-bold text-ink">1.2d</p></div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-ink">Adherence Trend (Last 30 Days)</h3>
          <div className="flex h-40 items-end gap-2">
            {[70, 78, 82, 85, 88, 92, 96].map((v, i) => (
              <div key={i} className="flex-1 rounded-t bg-navy" style={{ height: `${v}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-2 font-bold text-ink">Patient Risk Breakdown</h3>
          <div className="flex items-center justify-center">
            <div className="flex size-28 items-center justify-center rounded-full border-8 border-success">
              <span className="text-2xl font-bold text-ink">142</span>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-body">Total patients tracked</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">CHW Leaderboard: Sector A</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">CHW</th><th className="px-5 py-3">Visits</th><th className="px-5 py-3">Adherence Impact</th></tr>
            </thead>
            <tbody>
              <tr className="border-b border-border"><td className="px-5 py-3 text-sm font-semibold text-ink">Alice M.</td><td className="px-5 py-3 text-sm text-body">42</td><td className="px-5 py-3 text-sm text-success-text">+4.2%</td></tr>
              <tr><td className="px-5 py-3 text-sm font-semibold text-ink">Jean B.</td><td className="px-5 py-3 text-sm text-body">38</td><td className="px-5 py-3 text-sm text-success-text">+3.8%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
