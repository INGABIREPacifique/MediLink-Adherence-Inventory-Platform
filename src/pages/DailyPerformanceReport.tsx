import { useEffect, useState } from 'react';
import { performanceService } from '../services';
import type { DailyPerformance } from '../types';

// Rule-based aggregation only — no ML — per proposal §4.
export default function DailyPerformanceReport() {
  const [data, setData] = useState<DailyPerformance | null>(null);

  useEffect(() => {
    performanceService.getToday().then(setData);
  }, []);

  if (!data) return <div className="text-body">Loading report…</div>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-base text-ink">Daily Performance Report</h2>
        <p className="text-base text-body">{new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="flex gap-4">
        <div className="min-w-[180px] flex-1 rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-body">Adherence Rate</p>
          <p className="text-xs text-body">Confirmed doses / scheduled</p>
          <span className="text-[32px] font-bold leading-none text-ink">{data.adherenceRatePct}%</span>
        </div>
        <div className="min-w-[180px] flex-1 rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-body">Escalations Today</p>
          <p className="text-xs text-body">Missed dose or appointment</p>
          <span className="text-[32px] font-bold leading-none text-danger">{data.escalationsToday}</span>
        </div>
        <div className="min-w-[180px] flex-1 rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-body">Follow-ups Attended</p>
          <p className="text-xs text-body">Of those scheduled</p>
          <span className="text-[32px] font-bold leading-none text-success-text">{data.followUpsAttendedPct}%</span>
        </div>
      </div>
    </div>
  );
}
