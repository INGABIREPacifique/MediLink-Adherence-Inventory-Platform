import { Sparkles, TrendingUp } from 'lucide-react';

// Matches "Pharmacy Supply Chain Correlation Dashboard". FRONTEND ONLY.
export default function MinistrySupplyChainCorrelation() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Pharmacy Supply Chain Correlation</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-body">National Correlation</p>
          <p className="text-3xl font-bold text-navy">0.78 <span className="rounded bg-warning-bg px-1.5 py-0.5 text-xs text-warning-text">Moderate</span></p>
          <p className="mt-1 text-xs text-body">Stock availability vs. adherence rate, last 30 days.</p>
        </div>
        <div className="rounded-lg border border-navy-light/30 bg-navy-light/5 p-5">
          <h3 className="mb-2 flex items-center gap-2 font-bold text-navy"><Sparkles size={15} />AI Strategic Recommendation</h3>
          <p className="text-sm text-body">Pre-position stock in Musanze District ahead of forecasted demand -- historical correlation shows adherence drops 12% within 2 weeks of a stockout.</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Medication Impact Matrix</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Medication</th><th className="px-5 py-3">National Stock</th><th className="px-5 py-3">Adherence Impact</th></tr>
            </thead>
            <tbody>
              <tr className="border-b border-border"><td className="px-5 py-3 text-sm font-semibold text-ink">Tenofovir (TDF)</td><td className="px-5 py-3"><span className="rounded bg-success-bg px-2 py-0.5 text-xs text-success-text">92%</span></td><td className="px-5 py-3 text-sm text-success-text">+3.1%</td></tr>
              <tr className="border-b border-border"><td className="px-5 py-3 text-sm font-semibold text-ink">Amoxicillin</td><td className="px-5 py-3"><span className="rounded bg-warning-bg px-2 py-0.5 text-xs text-warning-text">72%</span></td><td className="px-5 py-3 text-sm text-danger">-1.4%</td></tr>
              <tr><td className="px-5 py-3 text-sm font-semibold text-ink">Insulin (Regular)</td><td className="px-5 py-3"><span className="rounded bg-danger-bg px-2 py-0.5 text-xs text-danger-text">41%</span></td><td className="px-5 py-3 text-sm text-danger">-4.6%</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-ink"><TrendingUp size={15} />Bottleneck Analysis</h3>
        <p className="mb-3 text-xs text-body">Lead time (days) vs. missed doses, by facility.</p>
        <div className="flex h-32 items-end gap-2">
          {[30, 45, 60, 40, 70, 35, 55].map((v, i) => (
            <div key={i} className="flex-1 rounded-t bg-navy" style={{ height: `${v}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
