import { useEffect, useState } from 'react';
import type { InventoryItem } from '../../types';
import { supabaseInventoryService } from '../../services/supabaseInventoryService';

// Matches "Pharmacy Supply Chain Correlation Dashboard". The original
// mock fabricated a correlation coefficient, an "AI Strategic
// Recommendation", and per-medication adherence-impact percentages --
// none of which are computed anywhere in this project (this project's
// real AI usage is scoped specifically to escalation-priority ranking,
// per the founding proposal; stock/adherence correlation analysis was
// never built). Rather than replace one set of invented numbers with
// another, this shows the one thing that IS real: current stock levels
// per medication. A genuine correlation feature would need adherence
// data joined per-medication over time, which is a real analytics
// feature to design later, not something to fake here.
export default function MinistrySupplyChainCorrelation() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseInventoryService.getItems().then(setItems).finally(() => setLoading(false));
  }, []);

  const statusStyles: Record<string, string> = {
    healthy: 'bg-success-bg text-success-text',
    low: 'bg-warning-bg text-warning-text',
    critical: 'bg-danger-bg text-danger-text',
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Pharmacy Supply Chain Status</h1>
        <p className="text-body">Real current stock by medication. Stock/adherence correlation analysis isn't built yet -- that needs adherence data joined per medication over time, a genuine analytics feature to design, not a number to fabricate here.</p>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4"><h3 className="font-bold text-ink">Current Stock by Medication</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Medication</th><th className="px-5 py-3">Current Stock</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={3} className="px-5 py-6 text-center text-sm text-body">Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-center text-sm text-body">No inventory items recorded.</td></tr>}
              {items.map((i) => (
                <tr key={i.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-ink">{i.name}</td>
                  <td className="px-5 py-3 text-sm text-body">{i.currentStock} {i.unit}</td>
                  <td className="px-5 py-3"><span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${statusStyles[i.status] ?? statusStyles.healthy}`}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
