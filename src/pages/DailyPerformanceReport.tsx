import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, TrendingUp, Package, CheckCircle2, Download } from 'lucide-react';
import { performanceService, inventoryService, alertsService } from '../services';
import { getSevenDayAdherenceTrend, getTodayDoseCounts } from '../services/supabasePerformanceService';
import { getAdherenceReportForToday } from '../services/supabaseReportService';
import { downloadCsv } from '../lib/exportCsv';
import type { DailyPerformance, InventoryItem, EscalationAlert } from '../types';

// Matches Figma node 1:11180 "MVP Daily Performance Report" structurally,
// but corrected in content: this tracks DISCHARGED patients confirming
// medication doses remotely via USSD from home, not inpatients on a
// hospital ward -- there is no "Ward 4" or bedside-shift concept here.
// All numbers are computed from real dose_reminders / inventory_items /
// escalations data, not hardcoded.
export default function DailyPerformanceReport() {
  const [data, setData] = useState<DailyPerformance | null>(null);
  const [counts, setCounts] = useState<{ totalScheduled: number; confirmed: number; missed: number } | null>(null);
  const [trend, setTrend] = useState<{ label: string; pct: number }[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [resolvedRecently, setResolvedRecently] = useState<EscalationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const report = await getAdherenceReportForToday();
      downloadCsv(`medilink-daily-adherence-report-${report.date}.csv`, [report]);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    Promise.all([
      performanceService.getToday(),
      getTodayDoseCounts(),
      getSevenDayAdherenceTrend(),
      inventoryService.getItems(),
      alertsService.getAlerts(),
    ]).then(([perf, doseCounts, sevenDay, items, alerts]) => {
      setData(perf);
      setCounts(doseCounts);
      setTrend(sevenDay);
      setLowStock([...items].sort((a, b) => a.currentStock / a.reorderThreshold - b.currentStock / b.reorderThreshold).slice(0, 3));
      setResolvedRecently(alerts.filter((a) => a.status === 'resolved' && a.followUpLogs?.length).slice(0, 3));
      setLoading(false);
    });
  }, []);

  if (loading || !data || !counts) return <div className="text-body">Loading report…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Daily Performance Report</h1>
          <p className="text-body">
            Post-Discharge Adherence Program · Internal Medicine Discharges ·{' '}
            {new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-body shadow-sm disabled:opacity-50"
        >
          <Download size={15} />
          {exporting ? 'Generating…' : 'Export CSV'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-ink">
            <ClipboardCheck size={16} className="text-navy" />
            Today's Adherence Summary
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-row-alt p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-body">Total Scheduled</p>
              <p className="text-2xl font-bold text-ink">{counts.totalScheduled}</p>
              <p className="text-xs text-body">USSD doses today</p>
            </div>
            <div className="rounded-lg bg-success-bg/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-success-text">Confirmed (USSD)</p>
              <p className="text-2xl font-bold text-success-text">{counts.confirmed}</p>
              <p className="text-xs text-success-text">{data.adherenceRatePct}% compliance</p>
            </div>
            <div className="rounded-lg bg-danger-bg/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-danger-text">Missed</p>
              <p className="text-2xl font-bold text-danger-text">{counts.missed}</p>
              <p className="text-xs text-danger-text">Requires follow-up</p>
            </div>
            <div className="rounded-lg bg-[#d7e2ff] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy">Escalations</p>
              <p className="text-2xl font-bold text-navy">{data.escalationsToday}</p>
              <p className="text-xs text-navy">Opened today</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-ink">
            <TrendingUp size={16} className="text-navy" />
            7-Day Trend
          </h2>
          <div className="flex h-32 items-end gap-2">
            {trend.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${i === trend.length - 1 ? 'bg-success' : 'bg-border'}`}
                  style={{ height: `${Math.max(d.pct, 4)}%` }}
                />
                <span className="text-[10px] text-body">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <Package size={16} className="text-navy" />
              Lowest Stock Items
            </h3>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {lowStock.map((item) => (
              <div key={item.id} className={`flex items-center justify-between px-5 py-3 ${item.status === 'critical' ? 'bg-danger-bg/30' : ''}`}>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-body">Threshold: {item.reorderThreshold} {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.status === 'critical' ? 'text-danger' : 'text-ink'}`}>{item.currentStock} {item.unit}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.status === 'healthy' ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'}`}>
                    {item.status === 'critical' ? 'Reorder Needed' : item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <CheckCircle2 size={16} className="text-success" />
              Recent Resolutions
            </h3>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {resolvedRecently.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-body">No resolved escalations with logged follow-up yet.</p>
            ) : (
              resolvedRecently.map((a) => {
                const log = a.followUpLogs?.[a.followUpLogs.length - 1];
                return (
                  <div key={a.id} className="flex gap-3 px-5 py-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
                      <CheckCircle2 size={12} />
                    </span>
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{log?.loggedBy ?? 'Staff'}</span> confirmed <Link to={`/patients/${a.patient.id}`} className="font-semibold text-navy-light hover:underline">{a.patient.name}</Link>'s dose via {log?.method ?? 'follow-up'} after a missed USSD reminder.
                      <span className="mt-1 block text-xs text-body">{a.resolvedAt ? new Date(a.resolvedAt).toLocaleString() : ''}</span>
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
