import { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { inventoryService } from '../services';
import type { InventoryItem, InventorySummary, StockStatus } from '../types';

const statusStyles: Record<StockStatus, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-danger-bg', text: 'text-danger-text', label: 'Critical' },
  warning: { bg: 'bg-warning-text/20', text: 'text-warning-text', label: 'Warning' },
  adequate: { bg: 'bg-row-alt', text: 'text-body', label: 'Adequate' },
  healthy: { bg: 'bg-success-bg', text: 'text-success-text', label: 'Healthy' },
};

export default function WardInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [i, s] = await Promise.all([inventoryService.getItems(), inventoryService.getSummary()]);
    setItems(i);
    setSummary(s);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function handleLog(id: string, delta: number) {
    await inventoryService.logUsage(id, delta);
    refresh();
  }

  if (loading) return <div className="text-body">Loading ward inventory…</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-base text-ink">Ward Inventory — Stock Log & Alerts</h2>
        <p className="max-w-2xl text-base text-body">
          Internal Medicine ward. Reorder threshold is a fixed rule-based baseline during the pilot phase.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="min-w-[160px] flex-1 rounded border border-border bg-white p-[17px] shadow-sm">
          <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-body">Total Items</p>
          <span className="text-[32px] font-bold leading-none text-ink">{summary?.totalItems ?? 0}</span>
        </div>
        <div className="min-w-[160px] flex-1 rounded border border-border bg-white p-[17px] shadow-sm">
          <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-body">Critical Stock</p>
          <span className="text-[32px] font-bold leading-none text-danger">{summary?.criticalCount ?? 0}</span>
        </div>
        <div className="min-w-[160px] flex-1 rounded border border-border bg-white p-[17px] shadow-sm">
          <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-body">Expiring &lt; 90 Days</p>
          <span className="text-[32px] font-bold leading-none text-warning-text">{summary?.expiringSoonCount ?? 0}</span>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border bg-bg px-6 py-4">
          <h3 className="text-xl font-semibold text-ink">Ward Stock Log</h3>
        </div>
        <table className="w-full">
          <thead className="border-b border-border bg-bg">
            <tr className="text-left text-xs font-semibold tracking-wide text-body">
              <th className="px-6 py-3">Medication</th>
              <th className="px-6 py-3">Current Stock</th>
              <th className="px-6 py-3">Reorder Threshold</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Log Usage</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const s = statusStyles[item.status];
              return (
                <tr key={item.id} className={`border-b border-border ${i % 2 === 1 ? 'bg-row-alt' : 'bg-white'}`}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-body">{item.form}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-ink">
                    {item.currentStock} <span className="font-normal text-body">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-body">{item.reorderThreshold}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center rounded-xl px-[11px] py-[5px] text-xs font-semibold tracking-wide ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleLog(item.id, -1)} aria-label="Log dose used" className="rounded p-1.5 text-body hover:bg-black/5">
                        <Minus size={15} />
                      </button>
                      <button onClick={() => handleLog(item.id, 10)} aria-label="Log restock" className="rounded p-1.5 text-success hover:bg-black/5">
                        <Plus size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
