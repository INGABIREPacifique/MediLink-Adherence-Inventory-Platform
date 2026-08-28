import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, TrendingUp, Sparkles, Loader2, Eye } from 'lucide-react';
import { alertsService } from '../services';
import { supabase } from '../lib/supabaseClient';
import { formatElapsed, formatClockTime } from '../services/format';
import { StatusBadge, DelayBadge } from '../components/ui/StatusBadge';
import { FollowUpLogModal } from '../components/modals/FollowUpLogModal';
import { ViewLogModal } from '../components/modals/ViewLogModal';
import type { AlertsSummary, EscalationAlert, FollowUpLogEntry } from '../types';

const priorityStyles: Record<NonNullable<EscalationAlert['aiPriority']>, string> = {
  critical: 'bg-danger-bg text-danger-text',
  high: 'bg-danger-bg/70 text-danger-text',
  medium: 'bg-warning-bg text-warning-text',
  low: 'bg-row-alt text-body',
};

type FilterTab = 'all' | 'pending' | 'in_progress';

const PAGE_SIZE = 10;

export default function EscalationInbox() {
  const [alerts, setAlerts] = useState<EscalationAlert[]>([]);
  const [summary, setSummary] = useState<AlertsSummary | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [logModalAlert, setLogModalAlert] = useState<EscalationAlert | null>(null);
  const [viewLogAlert, setViewLogAlert] = useState<EscalationAlert | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  async function refresh() {
    const [a, s] = await Promise.all([alertsService.getAlerts(), alertsService.getSummary()]);
    setAlerts(a);
    setSummary(s);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts;
    return alerts.filter((a) => a.status === filter);
  }, [alerts, filter]);

  const activeAlertsCount = useMemo(() => alerts.filter((a) => a.status !== 'resolved').length, [alerts]);

  async function handleLogFollowUp(entry: Omit<FollowUpLogEntry, 'id' | 'alertId' | 'loggedAt'>) {
    if (!logModalAlert) return;
    await alertsService.logFollowUp(logModalAlert.id, entry);
    // A confirmed dose is the one outcome that genuinely resolves the
    // case -- resolve it now, using the real note just entered rather
    // than a fabricated one. Previously there was a separate one-click
    // "Mark Resolved" checkmark that wrote the exact same hardcoded note
    // ("Reached by phone, confirmed dose taken.") every single time,
    // regardless of what actually happened -- removed in favor of this,
    // since a resolution record should reflect what was actually logged.
    if (entry.outcome === 'confirmed_taken') {
      await alertsService.resolveAlert(
        logModalAlert.id,
        entry.notes || `Confirmed via ${entry.method.replace('_', ' ')} by ${entry.loggedBy}.`
      );
    }
    refresh();
  }

  async function handleAnalyzePriority(escalationId: string) {
    setAnalyzingId(escalationId);
    try {
      const { error } = await supabase.functions.invoke('rank-escalation-priority', {
        body: { escalation_id: escalationId },
      });
      if (error) throw error;
      await refresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AI priority ranking failed -- is the rank-escalation-priority Edge Function deployed?', err);
    } finally {
      setAnalyzingId(null);
    }
  }

  if (loading) {
    return <div className="text-body">Loading escalation queue…</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-base text-ink">Escalation Inbox</h2>
          <p className="max-w-2xl text-base text-body">
            Manage urgent missed dose USSD alerts. Patients exceeding the 4-hour confirmation window require
            immediate nursing follow-up.
          </p>
        </div>

        <div className="flex items-stretch gap-4">
          <div className="min-w-[160px] rounded border border-border bg-white p-[17px] shadow-sm">
            <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-body">Active Alerts</p>
            <div className="flex items-center gap-2">
              <span className="text-[32px] font-bold leading-none text-danger">{activeAlertsCount}</span>
              {summary && summary.activeDelta > 0 && (
                <span className="flex items-center gap-1 rounded bg-danger-bg/50 px-1.5 py-0.5 text-sm text-danger">
                  <TrendingUp size={12} />+{summary.activeDelta}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-[160px] rounded border border-border bg-white p-[17px] shadow-sm">
            <p className="pb-1 text-xs font-semibold uppercase tracking-wider text-body">Resolved Today</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold leading-none text-success">{summary?.resolvedToday ?? 0}</span>
              <span className="text-sm text-body">/ {summary?.totalToday ?? 0} total</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e2e2e9]">
              <div
                className="h-full rounded-full bg-success"
                style={{
                  width: summary ? `${Math.min(100, (summary.resolvedToday / (summary.totalToday || 1)) * 100)}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-bg px-6 py-4">
          <h3 className="text-xl font-semibold text-ink">Priority Action Queue</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-border bg-bg p-[5px]">
              {(['all', 'pending', 'in_progress'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`rounded-xl px-3 py-1 text-xs font-semibold tracking-wide ${
                    filter === tab ? 'bg-navy-light text-[#9bbdff]' : 'text-body'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'pending' ? 'Pending' : 'In Progress'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-[800px] overflow-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg">
              <tr className="text-left text-xs font-semibold tracking-wide text-body">
                <th className="px-6 py-3">Patient Details</th>
                <th className="px-6 py-3">Medication Regimen</th>
                <th className="px-6 py-3">Delay Duration</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, PAGE_SIZE).map((alert, i) => {
                const resolved = alert.status === 'resolved';
                return (
                  <tr
                    key={alert.id}
                    className={`border-b border-border ${i % 2 === 1 ? 'bg-row-alt' : 'bg-white'} ${resolved ? 'opacity-75' : ''}`}
                  >
                    <td className="px-6 py-4">
                      {resolved ? (
                        <p className="text-sm font-semibold text-ink line-through decoration-body">{alert.patient.name}</p>
                      ) : (
                        <Link to={`/patients/${alert.patient.id}`} className="text-sm font-semibold text-ink hover:text-navy-light hover:underline">
                          {alert.patient.name}
                        </Link>
                      )}
                      {!resolved && (
                        <p className="flex items-center gap-1 pt-0.5 text-xs font-medium text-body">
                          <Phone size={11} />
                          {alert.patient.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {resolved ? (
                        <p className="text-sm font-medium text-body">{alert.medication}</p>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-navy">{alert.medication}</p>
                          <p className="text-xs font-medium text-body">{alert.phase}</p>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {resolved ? (
                        <span className="text-sm font-medium text-body">
                          Resolved at {alert.resolvedAt ? formatClockTime(alert.resolvedAt) : '—'}
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <DelayBadge
                            minutesLabel={formatElapsed(alert.missedAt)}
                            urgent={alert.status === 'pending'}
                          />
                          {alert.aiPriority ? (
                            <span
                              title={alert.aiReasoning}
                              className={`inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityStyles[alert.aiPriority]}`}
                            >
                              <Sparkles size={9} />
                              AI: {alert.aiPriority}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAnalyzePriority(alert.id)}
                              disabled={analyzingId === alert.id}
                              className="inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-navy-light hover:bg-black/5 disabled:opacity-50"
                            >
                              {analyzingId === alert.id ? <Loader2 size={9} className="animate-spin" /> : <Sparkles size={9} />}
                              {analyzingId === alert.id ? 'Analyzing…' : 'AI Priority'}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={alert.status} />
                    </td>
                    <td className="px-6 py-4">
                      {resolved ? (
                        <div className="flex justify-end">
                          <button
                            onClick={() => setViewLogAlert(alert)}
                            className="flex items-center gap-1 text-xs font-semibold tracking-wide text-navy-light underline decoration-border"
                          >
                            <Eye size={12} />
                            View Log
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`tel:${alert.patient.phone}`}
                            aria-label={`Call ${alert.patient.name}`}
                            className="rounded p-1.5 text-navy-light hover:bg-black/5"
                          >
                            <Phone size={15} />
                          </a>
                          <button
                            onClick={() => setLogModalAlert(alert)}
                            aria-label="Log follow-up"
                            className={`rounded p-1.5 hover:bg-black/5 ${
                              alert.status === 'in_progress' ? 'bg-[#d7e2ff] text-navy-light' : 'text-body'
                            }`}
                          >
                            <MessageSquare size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-body">
                    No alerts in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-bg px-6 py-3">
          <p className="text-sm text-body">
            Showing {Math.min(filtered.length, PAGE_SIZE)} of {filtered.length} alerts
          </p>
        </div>
      </div>

      {logModalAlert && (
        <FollowUpLogModal
          alert={logModalAlert}
          onClose={() => setLogModalAlert(null)}
          onSubmit={handleLogFollowUp}
        />
      )}
      {viewLogAlert && <ViewLogModal alert={viewLogAlert} onClose={() => setViewLogAlert(null)} />}
    </div>
  );
}
