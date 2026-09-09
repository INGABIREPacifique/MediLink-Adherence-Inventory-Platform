import { useEffect, useState } from 'react';
import { TrendingUp, Users, AlertTriangle, ClipboardList } from 'lucide-react';
import { getClinicalFollowUpStats, type ClinicalFollowUpStats } from '../../services/supabaseMinistryService';

// Matches Figma "Clinical Follow-Up Dashboard" content. Real data as of
// migrations 0018-0019 -- all four numbers here are genuinely real
// (unlike Sector Reports/Detail, none of these need facility linkage).
// "Live Sync" badge stays decorative -- real-time push at this tier
// would need a Realtime subscription, not built for this dashboard yet.
export default function MinistryClinical() {
  const [stats, setStats] = useState<ClinicalFollowUpStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClinicalFollowUpStats().then(setStats).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Clinical Follow-Up</h1>
          <p className="text-body">Adherence monitoring and CHW coordination.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-body"><p className="text-xs font-semibold uppercase tracking-wide">Adherence Rate</p><TrendingUp size={15} className="text-success" /></div>
          <p className="mt-1 text-3xl font-bold text-success-text">{loading ? '—' : `${stats?.adherenceRatePct}%`}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-body"><p className="text-xs font-semibold uppercase tracking-wide">Active Patients</p><Users size={15} /></div>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : stats?.activePatients}</p>
        </div>
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5">
          <div className="flex items-center justify-between text-danger-text"><p className="text-xs font-semibold uppercase tracking-wide">Missed Doses (24h)</p><AlertTriangle size={15} /></div>
          <p className="mt-1 text-3xl font-bold text-danger-text">{loading ? '—' : stats?.missedDosesLast24h}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-warning-text"><p className="text-xs font-semibold uppercase tracking-wide">Pending CHW Escalations</p><ClipboardList size={15} /></div>
          <p className="mt-1 text-3xl font-bold text-warning-text">{loading ? '—' : stats?.pendingEscalations}</p>
        </div>
      </div>
    </div>
  );
}
