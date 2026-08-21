import { useEffect, useState } from 'react';
import { AlertTriangle, SlidersHorizontal, ArrowUpDown, Minus, Plus, Download } from 'lucide-react';
import { inventoryService } from '../services';
import type { InventoryItem, InventorySummary, StockStatus } from '../types';

// Matches Figma node 1:10655 "MVP Ward Inventory - Stock Log & Alerts"
// exactly: a card grid (not a table), left-border color-coded by status,
// a Critical Stock Warning banner, and a total-items summary card --
// not the data-table layout the earlier version used.
const statusPill: Record<StockStatus, { bg: string; text: string; label: string; border: string }> = {
  critical: { bg: 'bg-danger-bg', text: 'text-danger-text', label: 'Critical', border: 'border-danger' },
  warning: { bg: 'bg-danger-bg', text: 'text-danger-text', label: 'Low Stock', border: 'border-danger' },
  adequate: { bg: 'bg-warning-bg', text: 'text-warning-text', label: 'Monitor', border: 'border-warning-text' },
  healthy: { bg: 'bg-success-bg', text: 'text-success-text', label: 'Optimal', border: 'border-success' },
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

  const criticalItems = items.filter((i) => i.status === 'critical' || i.status === 'warning');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Ward Inventory</h1>
          <p className="text-body">Manage physical stock levels and manual reorder thresholds.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-light">
          <Download size={15} />
          Export Ledger
        </button>
      </div>

      <div className="flex gap-4">
        {criticalItems.length > 0 && (
          <div className="flex flex-1 items-start gap-3 rounded-lg border border-danger/30 bg-danger-bg p-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger text-white">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-danger-text">Critical Stock Warning</p>
              <p className="text-sm text-danger-text">
                {criticalItems.length} medication{criticalItems.length !== 1 ? 's' : ''} have fallen below manual
                reorder thresholds and require immediate attention.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {criticalItems.map((item) => (
                  <span key={item.id} className="rounded-full border border-danger/30 bg-white px-3 py-1 text-xs font-semibold text-danger-text">
                    {item.name} ({item.currentStock} left)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="min-w-[220px] rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-body">Total Inventory Items</p>
          <p className="text-3xl font-bold text-navy">{summary?.totalItems ?? 0}</p>
          <p className="mt-1 text-xs text-success-text">
            {(summary?.totalItems ?? 0) - (summary?.criticalCount ?? 0)} items at optimal levels
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Active Formularies</h2>
        <div className="flex gap-2">
          <button aria-label="Sort" className="rounded-lg border border-border bg-white p-2 text-body hover:bg-black/5">
            <ArrowUpDown size={15} />
          </button>
          <button aria-label="Filter" className="rounded-lg border border-border bg-white p-2 text-body hover:bg-black/5">
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const pill = statusPill[item.status];
          return (
            <div
              key={item.id}
              className={`flex flex-col gap-3 rounded-lg border-l-4 border-y border-r border-border bg-white p-5 shadow-sm ${pill.border}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-ink">{item.name}</p>
                  <p className="text-sm text-body">{item.form}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pill.bg} ${pill.text}`}>
                  {pill.label}
                </span>
              </div>

              <div>
                <span className="text-3xl font-bold text-ink">{item.currentStock}</span>{' '}
                <span className="text-sm text-body">{item.unit}</span>
              </div>
              <p className="text-xs text-danger">Threshold: {item.reorderThreshold} {item.unit}</p>

              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => handleLog(item.id, -1)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-bg py-2 text-sm font-semibold text-body hover:bg-black/5"
                >
                  <Minus size={14} />
                  Stock-Out
                </button>
                <button
                  onClick={() => handleLog(item.id, 10)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-navy py-2 text-sm font-semibold text-white hover:bg-navy-light"
                >
                  <Plus size={14} />
                  Stock-In
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
