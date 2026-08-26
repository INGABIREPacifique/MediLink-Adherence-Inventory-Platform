import { TrendingUp, Users, AlertTriangle, ClipboardList } from 'lucide-react';

// Matches Figma "Clinical Follow-Up Dashboard" content. FRONTEND ONLY --
// mock data, "Live Sync" badge is decorative (no real-time wiring at this
// tier yet -- that's the backend phase).
export default function MinistryClinical() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Clinical Follow-Up</h1>
          <p className="text-body">Real-time adherence monitoring and CHW coordination.</p>
        </div>
        <span className="rounded-full bg-row-alt px-3 py-1 text-xs font-semibold text-body">● Live Sync</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-body"><p className="text-xs font-semibold uppercase tracking-wide">Adherence Rate</p><TrendingUp size={15} className="text-success" /></div>
          <p className="mt-1 text-3xl font-bold text-success-text">92%</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-body"><p className="text-xs font-semibold uppercase tracking-wide">Active Patients</p><Users size={15} /></div>
          <p className="mt-1 text-3xl font-bold text-ink">1,452</p>
        </div>
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5">
          <div className="flex items-center justify-between text-danger-text"><p className="text-xs font-semibold uppercase tracking-wide">Missed Doses (24h)</p><AlertTriangle size={15} /></div>
          <p className="mt-1 text-3xl font-bold text-danger-text">38</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-warning-text"><p className="text-xs font-semibold uppercase tracking-wide">Pending CHW Escalations</p><ClipboardList size={15} /></div>
          <p className="mt-1 text-3xl font-bold text-warning-text">12</p>
        </div>
      </div>
    </div>
  );
}
