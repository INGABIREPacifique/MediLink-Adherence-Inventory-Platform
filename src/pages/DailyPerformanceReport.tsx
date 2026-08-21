import { useEffect, useState } from 'react';
import { ClipboardCheck, TrendingUp, Package, CheckCircle2, Download } from 'lucide-react';
import { performanceService } from '../services';
import type { DailyPerformance } from '../types';

// Matches Figma node 1:11180 "MVP Daily Performance Report - Ward Overview":
// 4-cell adherence summary, 7-day trend chart, key ward stock list, and a
// recent-resolutions activity feed. Rule-based aggregation only -- no ML --
// per proposal §4.
export default function DailyPerformanceReport() {
  const [data, setData] = useState<DailyPerformance | null>(null);

  useEffect(() => {
    performanceService.getToday().then(setData);
  }, []);

  if (!data) return <div className="text-body">Loading report…</div>;

  const totalScheduled = 142; // static per Figma reference until wired to real Supabase aggregation

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Daily Performance Report</h1>
          <p className="text-body">Ward 4 – Internal Medicine · {new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-body shadow-sm">
          <Download size={15} />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-ink">
            <ClipboardCheck size={16} className="text-navy" />
            Today's Adherence Summary
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg bg-row-alt p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-body">Total Scheduled</p>
              <p className="text-2xl font-bold text-ink">{totalScheduled}</p>
              <p className="text-xs text-body">doses today</p>
            </div>
            <div className="rounded-lg bg-success-bg/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-success-text">Confirmed (USSD)</p>
              <p className="text-2xl font-bold text-success-text">{Math.round((totalScheduled * data.adherenceRatePct) / 100)}</p>
              <p className="text-xs text-success-text">{data.adherenceRatePct}% compliance</p>
            </div>
            <div className="rounded-lg bg-danger-bg/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-danger-text">Missed</p>
              <p className="text-2xl font-bold text-danger-text">{data.escalationsToday}</p>
              <p className="text-xs text-danger-text">Requires follow-up</p>
            </div>
            <div className="rounded-lg bg-[#d7e2ff] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy">Resolved</p>
              <p className="text-2xl font-bold text-navy">{data.escalationsToday}</p>
              <p className="text-xs text-navy">By nursing staff</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-ink">
            <TrendingUp size={16} className="text-navy" />
            7-Day Trend
          </h2>
          <div className="flex h-32 items-end gap-2">
            {[60, 68, 72, 78, 74, 80, data.adherenceRatePct].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${i === 6 ? 'bg-success' : 'bg-border'}`}
                  style={{ height: `${v}%` }}
                />
                <span className="text-[10px] text-body">{['W', 'T', 'F', 'S', 'S', 'M', 'T'][i]}</span>
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
              Key Ward Stock
            </h3>
            <button className="text-sm font-semibold text-navy-light">View All</button>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {[
              { name: 'Amoxicillin 500mg', threshold: '200 units', stock: '450 units', status: 'Optimal' },
              { name: 'Paracetamol 1g', threshold: '500 units', stock: '1,200 units', status: 'Optimal' },
              { name: 'IV Fluids (Saline 0.9%)', threshold: '100 bags', stock: '42 bags', status: 'Reorder Needed' },
            ].map((item) => (
              <div key={item.name} className={`flex items-center justify-between px-5 py-3 ${item.status !== 'Optimal' ? 'bg-danger-bg/30' : ''}`}>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-body">Threshold: {item.threshold}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.status !== 'Optimal' ? 'text-danger' : 'text-ink'}`}>{item.stock}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.status === 'Optimal' ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'}`}>
                    {item.status}
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
            <div className="flex gap-3 px-5 py-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                <ClipboardCheck size={12} />
              </span>
              <p className="text-sm text-ink">
                <span className="font-semibold">Nurse Uwase</span> resolved a missed evening dose for Bed 12. Patient was asleep during rounds; dose administered at 22:00.
                <span className="mt-1 block text-xs text-body">Today, 08:15 AM</span>
              </p>
            </div>
            <div className="flex gap-3 px-5 py-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <CheckCircle2 size={12} />
              </span>
              <p className="text-sm text-ink">
                100% adherence rate achieved in the pediatric wing for the morning shift. Great teamwork!
                <span className="mt-1 block text-xs text-body">Today, 02:30 PM</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
