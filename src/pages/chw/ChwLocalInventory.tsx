import { useEffect, useState } from 'react';
import { Package, AlertTriangle, Calendar, Minus } from 'lucide-react';
import { inventoryService } from '../../services';
import type { InventoryItem, InventorySummary } from '../../types';

// Matches Figma "CHW Field App - Local Inventory" (node 1:6740): a CHW's
// view of the same facility stock (this pilot has one shared inventory,
// not separate ward vs. field kits), styled as mobile cards rather than
// the nurse's grid layout, with a direct Log Usage action for what they
// use during home visits.
export default function ChwLocalInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function refresh() {
    const [i, s] = await Promise.all([inventoryService.getItems(), inventoryService.getSummary()]);
    setItems(i);
    setSummary(s);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleLogUsage(id: string) {
    await inventoryService.logUsage(id, -1);
    refresh();
  }

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  if (loading || !summary) return <div className="text-body">Loading inventory…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Local Inventory</h1>
        <p className="text-body">Supplies available for home visits, drawn from the facility's shared stock.</p>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search medications, batches…"
        className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-ink shadow-sm"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
          <Package size={16} className="text-navy" />
          <p className="mt-1 text-2xl font-bold text-ink">{summary.totalItems}</p>
          <p className="text-xs text-body">Total Items</p>
        </div>
        <div className="rounded-lg border border-danger/30 bg-danger-bg/50 p-4">
          <AlertTriangle size={16} className="text-danger" />
          <p className="mt-1 text-2xl font-bold text-danger-text">{summary.criticalCount}</p>
          <p className="text-xs text-danger-text">Low Stock</p>
        </div>
        <div className="rounded-lg border border-warning-text/30 bg-warning-bg/50 p-4">
          <Calendar size={16} className="text-warning-text" />
          <p className="mt-1 text-2xl font-bold text-warning-text">{summary.expiringSoonCount}</p>
          <p className="text-xs text-warning-text">Expiring Soon</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-ink">{item.name}</p>
                <p className="text-xs text-body">{item.form}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'critical' ? 'bg-danger-bg text-danger-text' : item.status === 'healthy' ? 'bg-success-bg text-success-text' : 'bg-warning-bg text-warning-text'}`}>
                {item.status === 'critical' ? 'Low Stock' : item.status === 'healthy' ? 'Stable' : item.status}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded bg-bg p-2">
                <p className="text-[10px] font-semibold uppercase text-body">Quantity</p>
                <p className="text-sm font-bold text-ink">{item.currentStock} {item.unit}</p>
              </div>
              <div className="rounded bg-bg p-2">
                <p className="text-[10px] font-semibold uppercase text-body">Expiry</p>
                <p className="text-sm font-bold text-ink">{item.expiresOn ? new Date(item.expiresOn).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}</p>
              </div>
            </div>
            <div className="mt-3">
              <button onClick={() => handleLogUsage(item.id)} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-navy py-2 text-sm font-semibold text-white">
                <Minus size={13} />
                Log Usage
              </button>
            </div>
            {/* Figma shows a "Request Restock" action here too, but no
                replenishment-request/approval system exists in this pilot
                (that's the full-platform "Replenishment Approval Flow"
                screen, Phase 3+ scope) -- a button that silently added
                stock with no approval trail would be worse than omitting
                it, so it's left out rather than faked. */}
          </div>
        ))}
      </div>
    </div>
  );
}
