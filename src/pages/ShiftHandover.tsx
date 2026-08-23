import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, Phone, CheckCircle2 } from 'lucide-react';
import { handoverService, alertsService, inventoryService } from '../services';
import type { EscalationAlert, InventoryItem } from '../types';

// Matches Figma node 1:11423 "MVP Nurse Shift Handover - Ward Status".
// Table rows now pull real unresolved escalations + critical stock from
// Supabase (via the same alertsService/inventoryService already wired for
// Escalation Inbox / Ward Inventory) instead of hardcoded demo rows.

function formatMissedBy(missedAt: string): { label: string; urgent: boolean } {
  const hours = (Date.now() - new Date(missedAt).getTime()) / (1000 * 60 * 60);
  if (hours < 1) return { label: `${Math.round(hours * 60)} min`, urgent: false };
  return { label: `${hours.toFixed(1)} hours`, urgent: hours >= 4 };
}

export default function ShiftHandover() {
  const [snapshot, setSnapshot] = useState<{ pendingEscalationsCount: number; lowStockItemsCount: number } | null>(null);
  const [escalations, setEscalations] = useState<EscalationAlert[]>([]);
  const [criticalStock, setCriticalStock] = useState<InventoryItem[]>([]);
  const [notes, setNotes] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([handoverService.getPendingSnapshot(), alertsService.getAlerts(), inventoryService.getItems()]).then(
      ([snap, alerts, items]) => {
        setSnapshot(snap);
        setEscalations(alerts.filter((a) => a.status !== 'resolved'));
        setCriticalStock(items.filter((i) => i.status === 'critical'));
        setLoading(false);
      }
    );
  }, []);

  async function handleAcknowledge() {
    await handoverService.submitHandover(notes, 'Outgoing Nurse', 'Incoming Staff');
    setAcknowledged(true);
  }

  if (loading) return <div className="text-body">Loading handover data…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg border border-border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-ink">Nurse Daily Handover</h1>
          <p className="text-sm text-body">Post-Discharge Monitoring Team · Shift Handover (07:00 – 15:00)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <AlertTriangle size={16} className="text-danger" />
              Unresolved Escalations
            </h3>
            <span className="rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text">
              {snapshot?.pendingEscalationsCount ?? escalations.length} Pending
            </span>
          </div>
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr>
                <th className="px-5 py-2">Patient</th>
                <th className="px-5 py-2">Medication</th>
                <th className="px-5 py-2">Missed By</th>
                <th className="px-5 py-2">Action Required</th>
              </tr>
            </thead>
            <tbody>
              {escalations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-sm text-body">No unresolved escalations.</td>
                </tr>
              ) : (
                escalations.map((e) => {
                  const missed = formatMissedBy(e.missedAt);
                  return (
                    <tr key={e.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-ink">{e.patient.name}</p>
                        <p className="text-xs text-body">{e.phase}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-body">{e.medication}</td>
                      <td className={`px-5 py-3 text-sm font-semibold ${missed.urgent ? 'text-danger' : 'text-body'}`}>{missed.label}</td>
                      <td className="px-5 py-3">
                        <a href={`tel:${e.patient.phone}`} className="flex items-center gap-1.5 text-sm font-semibold text-navy-light">
                          <Phone size={13} />
                          Follow-up Call
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <Package size={16} className="text-navy" />
              Critical Stock
            </h3>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {criticalStock.length === 0 ? (
              <p className="p-3 text-center text-sm text-body">No critical stock items.</p>
            ) : (
              criticalStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-warning-text/30 bg-warning-bg/40 p-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-body">Current: {item.currentStock} {item.unit}</p>
                  </div>
                  <span className="rounded bg-[#624800] px-2 py-1 text-xs font-semibold text-warning-text">Reorder</span>
                </div>
              ))
            )}
            <Link to="/inventory" className="mt-2 block rounded-lg border border-border py-2 text-center text-sm font-semibold text-body">
              View Full Inventory
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-bold text-ink">Outgoing Shift Notes</h3>
        </div>
        <div className="p-5">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Anything the incoming nurse needs to know…"
            className="w-full rounded-lg border border-border bg-bg p-3 text-sm text-ink"
          />
        </div>
      </div>

      <div className="flex justify-end">
        {acknowledged ? (
          <p className="rounded-lg border border-success/30 bg-success-bg/40 px-4 py-2.5 text-sm font-semibold text-success-text">
            Handover acknowledged and logged.
          </p>
        ) : (
          <button
            onClick={handleAcknowledge}
            className="flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-light"
          >
            <CheckCircle2 size={16} />
            Acknowledge & Start Shift
          </button>
        )}
      </div>
    </div>
  );
}
