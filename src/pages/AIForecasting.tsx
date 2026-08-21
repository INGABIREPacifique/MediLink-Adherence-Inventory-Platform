import { Radio, TrendingUp, Clock } from 'lucide-react';
import { mockInventory } from '../data/mockInventory';

// AI Forecasting -- per the proposal (§4, §10 Risks & Mitigations): demand
// forecasting is real AI, but it only activates "as consumption data
// accumulates" -- deliberately NOT faked with synthetic numbers for the
// pilot. This screen shows what the feature will look like once wired to
// the ai-service `/forecast/demand` endpoint, using the current rule-based
// reorder thresholds as the honest fallback in the meantime.
export default function AIForecasting() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-base text-ink">AI Demand Forecasting</h2>
        <p className="max-w-2xl text-base text-body">
          Not yet active for this pilot -- forecasting needs real consumption history to be trustworthy.
          Reorder decisions currently use the rule-based thresholds below.
        </p>
      </div>

      <div className="flex items-start gap-4 rounded-lg border border-navy-light/20 bg-navy-light/5 p-5">
        <Radio size={20} className="mt-0.5 shrink-0 text-navy-light" />
        <div>
          <p className="text-sm font-semibold text-navy">Forecasting activates automatically once enough data exists</p>
          <p className="mt-1 text-sm text-body">
            Per the pilot roadmap, this model trains on real ward consumption patterns during Months 4–6.
            Showing predictions before then would be guessing dressed up as AI -- so this stays off until it's real.
          </p>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border bg-bg px-6 py-4">
          <h3 className="text-xl font-semibold text-ink">Current Rule-Based Reorder Status</h3>
        </div>
        <table className="w-full">
          <thead className="border-b border-border bg-bg">
            <tr className="text-left text-xs font-semibold tracking-wide text-body">
              <th className="px-6 py-3">Medication</th>
              <th className="px-6 py-3">Current Stock</th>
              <th className="px-6 py-3">Reorder Threshold</th>
              <th className="px-6 py-3">AI Forecast</th>
            </tr>
          </thead>
          <tbody>
            {mockInventory.map((item, i) => (
              <tr key={item.id} className={`border-b border-border ${i % 2 === 1 ? 'bg-row-alt' : 'bg-white'}`}>
                <td className="px-6 py-4 text-sm font-semibold text-ink">{item.name}</td>
                <td className="px-6 py-4 text-sm text-body">{item.currentStock} {item.unit}</td>
                <td className="px-6 py-4 text-sm text-body">{item.reorderThreshold}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-body">
                    <Clock size={12} />
                    Awaiting consumption data
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-xs text-body">
        <TrendingUp size={14} />
        Backend endpoint ready at <code className="rounded bg-row-alt px-1.5 py-0.5">ai-service/forecast/demand</code> -- returns real predictions once wired to Supabase consumption history.
      </div>
    </div>
  );
}
