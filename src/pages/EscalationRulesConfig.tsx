import { useEffect, useState } from 'react';
import { AlertTriangle, MessageSquare, TrendingDown, History, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import { rulesService, alertsService } from '../services';
import { supabase } from '../lib/supabaseClient';
import type { EscalationRules, EscalationAlert } from '../types';

function relativeTime(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  return `${Math.round(hrs / 24)} day(s) ago`;
}

const statusIcon: Record<EscalationAlert['status'], React.ReactNode> = {
  pending: <MessageSquare size={12} />,
  in_progress: <TrendingDown size={12} />,
  resolved: <CheckCircle2 size={12} className="text-success" />,
};

const statusLabel: Record<EscalationAlert['status'], string> = {
  pending: 'SMS sent to Duty Nurse',
  in_progress: 'Follow-up in progress',
  resolved: 'Resolved',
};

// Matches Figma node 1:10485 "MVP Escalation Rules Configuration" exactly:
// toggle-able IF/THEN rule cards (not a plain settings form) plus a live
// "Recent Escalations" feed on the right. Missed-dose trigger stays
// rule-based; only the escalation priority ranking downstream is
// AI-assisted (proposal §4) -- this screen configures the rule, not the AI.
export default function EscalationRulesConfig() {
  const [rules, setRules] = useState<EscalationRules | null>(null);
  const [recentEscalations, setRecentEscalations] = useState<EscalationAlert[]>([]);
  const [runningCheck, setRunningCheck] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<string | null>(null);

  async function refreshRecent() {
    const alerts = await alertsService.getAlerts();
    setRecentEscalations(
      [...alerts].sort((a, b) => new Date(b.missedAt).getTime() - new Date(a.missedAt).getTime()).slice(0, 3)
    );
  }

  async function handleRunCheck() {
    setRunningCheck(true);
    setLastCheckResult(null);
    try {
      const results = await Promise.all([
        supabase.rpc('check_missed_doses'),
        supabase.rpc('check_upcoming_appointments'),
        supabase.rpc('check_consecutive_misses'),
        supabase.rpc('generate_upcoming_dose_reminders'),
      ]);
      const failed = results.find((r) => r.error);
      if (failed) throw failed.error;
      setLastCheckResult(`Checked at ${new Date().toLocaleTimeString()} -- missed doses, unconfirmed appointments, and consecutive-miss patterns were all evaluated, and upcoming dose reminders were extended forward.`);
      await refreshRecent();
    } catch (err) {
      setLastCheckResult(`Check failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunningCheck(false);
    }
  }

  async function toggleConsecutiveMisses() {
    if (!rules) return;
    const updated = await rulesService.updateRules({ consecutiveMissesEnabled: !rules.consecutiveMissesEnabled });
    setRules(updated);
  }

  useEffect(() => {
    rulesService.getRules().then(setRules);
    refreshRecent();
  }, []);

  async function handleWindowChange(minutes: number) {
    if (!rules) return;
    const updated = await rulesService.updateRules({ missedDoseWindowMinutes: minutes });
    setRules(updated);
  }

  if (!rules) return <div className="text-body">Loading rules…</div>;

  const hours = Math.round(rules.missedDoseWindowMinutes / 60);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Escalation Configuration</h1>
          <p className="text-body">Manage automated alert rules for patient adherence monitoring.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRunCheck}
            disabled={runningCheck}
            className="flex items-center gap-2 rounded-lg border border-navy-light bg-white px-4 py-2.5 text-sm font-semibold text-navy-light disabled:opacity-50"
          >
            <RefreshCw size={15} className={runningCheck ? 'animate-spin' : ''} />
            {runningCheck ? 'Checking…' : 'Run Escalation Check'}
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-body">
            <History size={15} />
            Audit Log
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
            <Plus size={15} />
            New Rule
          </button>
        </div>
      </div>

      {lastCheckResult && (
        <p className={`rounded-lg border px-4 py-3 text-sm ${lastCheckResult.startsWith('Check failed') ? 'border-danger/30 bg-danger-bg/40 text-danger-text' : 'border-success/30 bg-success-bg/40 text-success-text'}`}>
          {lastCheckResult}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border-l-4 border-l-success border-border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-success-bg text-success-text">
                  <MessageSquare size={16} />
                </span>
                <p className="font-bold text-ink">Missed USSD Confirmation</p>
              </div>
              <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">Always Active</span>
            </div>

            <div className="mt-4 rounded-lg bg-bg p-4 text-sm text-ink">
              <p>
                <span className="font-bold">IF</span> no USSD confirmation is received within{' '}
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => handleWindowChange(Number(e.target.value) * 60)}
                  className="w-10 rounded border border-navy-light bg-white px-1 text-center font-semibold text-navy-light"
                />{' '}
                hours of scheduled dose time,
              </p>
              <p className="mt-1">
                <span className="font-bold text-danger">THEN</span> Alert{' '}
                <span className="rounded border border-border bg-white px-2 py-0.5 font-semibold text-danger">Duty Nurse</span> via{' '}
                <span className="rounded border border-border bg-white px-2 py-0.5 font-semibold">SMS &amp; Dashboard</span>.
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-body">
              <span>Runs automatically via <code className="rounded bg-row-alt px-1">check_missed_doses()</code>, every 15 minutes</span>
            </div>
          </div>

          <div className={`rounded-lg border border-border bg-white p-5 shadow-sm ${rules?.consecutiveMissesEnabled ? '' : 'opacity-70'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-row-alt text-body">
                  <TrendingDown size={16} />
                </span>
                <p className="font-bold text-ink">Consecutive Misses</p>
              </div>
              <button
                onClick={toggleConsecutiveMisses}
                aria-label="Toggle rule"
                className={`relative h-6 w-11 rounded-full transition-colors ${rules?.consecutiveMissesEnabled ? 'bg-navy' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${rules?.consecutiveMissesEnabled ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="mt-4 rounded-lg bg-bg p-4 text-sm text-ink">
              <p><span className="font-bold">IF</span> patient misses {rules?.consecutiveMissesThreshold ?? 3} consecutive scheduled doses,</p>
              <p className="mt-1"><span className="font-bold">THEN</span> Escalate immediately at "high" priority (rule-based override -- no AI call needed to know a pattern of misses is urgent).</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-body">
              <span>{rules?.consecutiveMissesEnabled ? 'Runs automatically every 15 minutes' : 'Currently disabled'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-danger" />
              <h3 className="font-bold text-ink">Recent Escalations</h3>
            </div>
            <span className="rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text">Live</span>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {recentEscalations.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-body">No escalations yet.</p>
            ) : (
              recentEscalations.map((e) => (
                <div key={e.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">{e.patient.name}</span>
                    <span className="text-xs text-body">{relativeTime(e.missedAt)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-body">Missed dose: {e.medication} ({e.phase})</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-navy-light">
                    {statusIcon[e.status]}
                    {statusLabel[e.status]}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border px-5 py-3 text-center">
            <button className="text-sm font-semibold text-navy-light">View All Escalations</button>
          </div>
        </div>
      </div>
    </div>
  );
}
