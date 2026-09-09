import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabaseAlertsService } from '../services/supabaseAlertsService';
import { supabase } from '../lib/supabaseClient';
import type { EscalationAlert } from '../types';

// Matches Figma node 1:8147 "CHW Supervisor - Escalation Resolution
// Dashboard" -- complements the existing (real) Supervisor Dashboard
// (/supervisor, CHW roster + response-time KPIs) with an
// escalation-resolution-focused view: a queue nurses/admins work
// through, plus real CHW workload from chw_visits. Same underlying
// escalations table as the Escalation Inbox (migration 0001) -- this is
// a different lens on the same real data, not a new data source. The
// "Optimization Suggestion" panel from the original mock (a hardcoded
// reassignment recommendation) is dropped -- nothing in this project
// computes workload-balancing suggestions, so it isn't shown rather
// than replaced with a different invented recommendation.

interface ChwWorkload {
  name: string;
  activeVisits: number;
}

export default function ChwSupervisorEscalationDashboard() {
  const [alerts, setAlerts] = useState<EscalationAlert[]>([]);
  const [workload, setWorkload] = useState<ChwWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      supabaseAlertsService.getAlerts(),
      supabase.from('chw_visits').select('logged_by, profiles:logged_by ( full_name )').eq('outcome', 'visited'),
    ]).then(([alertRows, visits]) => {
      setAlerts(alertRows);
      const counts = new Map<string, ChwWorkload>();
      ((visits.data ?? []) as unknown as { logged_by: string | null; profiles: { full_name: string } | null }[]).forEach((v) => {
        if (!v.logged_by) return;
        const name = v.profiles?.full_name ?? 'Unknown CHW';
        const existing = counts.get(v.logged_by);
        counts.set(v.logged_by, { name, activeVisits: (existing?.activeVisits ?? 0) + 1 });
      });
      setWorkload(Array.from(counts.values()).sort((a, b) => b.activeVisits - a.activeVisits));
      setLoading(false);
    });
  }

  useEffect(load, []);

  const pending = alerts.filter((a) => a.status === 'pending');
  const resolvedRows = alerts.filter((a) => a.status === 'resolved' && a.resolvedAt);
  const avgResolutionHrs = resolvedRows.length
    ? Math.round((resolvedRows.reduce((sum, a) => sum + (new Date(a.resolvedAt!).getTime() - new Date(a.missedAt).getTime()), 0) / resolvedRows.length) / (1000 * 60 * 60) * 10) / 10
    : null;
  const resolvedUnder24h = resolvedRows.filter((a) => (new Date(a.resolvedAt!).getTime() - new Date(a.missedAt).getTime()) < 24 * 60 * 60 * 1000).length;
  const pctResolvedUnder24h = resolvedRows.length ? Math.round((resolvedUnder24h / resolvedRows.length) * 100) : null;
  const highRiskCount = pending.filter((a) => a.aiPriority === 'critical' || a.aiPriority === 'high').length;

  async function markInProgress(id: string) {
    setActingOn(id);
    await supabaseAlertsService.updateAlertStatus(id, 'in_progress');
    load();
    setActingOn(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Escalation Management</h1>
          <p className="text-body">Supervisor View</p>
        </div>
        <Link to="/supervisor" className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-navy-light shadow-sm">
          CHW Roster Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-danger-text"><AlertTriangle size={13} /> Active Escalations</p>
          <p className="mt-1 text-3xl font-bold text-danger-text">{loading ? '—' : pending.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-body">Avg Resolution</p>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : avgResolutionHrs !== null ? `${avgResolutionHrs}h` : 'N/A'}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-body">% Resolved &lt; 24h</p>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : pctResolvedUnder24h !== null ? `${pctResolvedUnder24h}%` : 'N/A'}</p>
        </div>
        <div className="rounded-lg border border-warning/30 bg-warning-bg/40 p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-warning-text"><ShieldAlert size={13} /> High-Risk Pending</p>
          <p className="mt-1 text-3xl font-bold text-warning-text">{loading ? '—' : highRiskCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-4">
            <h3 className="font-bold text-ink">Active Resolution Queue</h3>
            <span className="rounded-full bg-danger-bg px-3 py-1 text-xs font-semibold text-danger-text">{pending.length} Pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-body">
                <tr><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3 text-right">Action</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-body">Loading…</td></tr>}
                {!loading && pending.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-body">No pending escalations.</td></tr>}
                {pending.map((a) => (
                  <tr key={a.id} className={`border-b border-border last:border-0 ${a.aiPriority === 'critical' ? 'bg-danger-bg/20' : ''}`}>
                    <td className="px-4 py-3"><p className="text-sm font-semibold text-ink">{a.patient.name}</p></td>
                    <td className="px-4 py-3 text-sm text-ink">{a.medication} — {a.phase || 'Missed dose'}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-bg px-2.5 py-1 text-xs font-semibold capitalize text-body">{a.aiPriority ?? 'Standard'}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button disabled={actingOn === a.id} onClick={() => markInProgress(a.id)} className="rounded bg-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">CHW Workload</h3>
            <Link to="/supervisor" className="text-sm font-semibold text-navy-light">View All</Link>
          </div>
          {loading && <p className="text-sm text-body">Loading…</p>}
          {!loading && workload.length === 0 && <p className="text-sm text-body">No visits logged yet.</p>}
          {workload.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded border border-border bg-bg p-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white">{c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</span>
                <p className="text-sm font-semibold text-ink">{c.name}</p>
              </div>
              <p className="flex items-center gap-1 text-sm font-bold text-ink"><CheckCircle2 size={13} className="text-success" /> {c.activeVisits} visits</p>
            </div>
          ))}
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-body"><Clock size={12} /> Reflects the same escalation records as the Escalation Inbox — this is a resolution-workflow view, not a separate data source.</p>
    </div>
  );
}
