import { useEffect, useState } from 'react';
import { AlertTriangle, MessageSquare, TrendingDown, History, Plus, CheckCircle2 } from 'lucide-react';
import { rulesService } from '../services';
import type { EscalationRules } from '../types';

// Matches Figma node 1:10485 "MVP Escalation Rules Configuration" exactly:
// toggle-able IF/THEN rule cards (not a plain settings form) plus a live
// "Recent Escalations" feed on the right. Missed-dose trigger stays
// rule-based; only the escalation priority ranking downstream is
// AI-assisted (proposal §4) -- this screen configures the rule, not the AI.
export default function EscalationRulesConfig() {
  const [rules, setRules] = useState<EscalationRules | null>(null);
  const [missedDoseEnabled, setMissedDoseEnabled] = useState(true);
  const [consecutiveMissesEnabled, setConsecutiveMissesEnabled] = useState(false);

  useEffect(() => {
    rulesService.getRules().then(setRules);
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
              <button
                onClick={() => setMissedDoseEnabled((v) => !v)}
                aria-label="Toggle rule"
                className={`relative h-6 w-11 rounded-full transition-colors ${missedDoseEnabled ? 'bg-navy' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${missedDoseEnabled ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
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
              <span>Last modified by Ward Admin</span>
              <button className="font-semibold text-navy-light">Edit Details</button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-sm opacity-70">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-row-alt text-body">
                  <TrendingDown size={16} />
                </span>
                <p className="font-bold text-ink">Consecutive Misses</p>
              </div>
              <button
                onClick={() => setConsecutiveMissesEnabled((v) => !v)}
                aria-label="Toggle rule"
                className={`relative h-6 w-11 rounded-full transition-colors ${consecutiveMissesEnabled ? 'bg-navy' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${consecutiveMissesEnabled ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="mt-4 rounded-lg bg-bg p-4 text-sm text-ink">
              <p><span className="font-bold">IF</span> patient misses 3 consecutive scheduled doses,</p>
              <p className="mt-1"><span className="font-bold">THEN</span> Escalate to Facility Manager via Dashboard Priority Queue.</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-body">
              <span>Last modified by System Admin</span>
              <button className="font-semibold text-navy-light">Edit Details</button>
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
            {[
              { id: 'PT-8842', time: '10 mins ago', text: 'Missed USSD confirmation (4hr threshold reached).', status: 'SMS sent to Duty Nurse', icon: <MessageSquare size={12} /> },
              { id: 'PT-2109', time: '45 mins ago', text: 'Missed USSD confirmation (4hr threshold reached).', status: 'Acknowledged by CHW', icon: <CheckCircle2 size={12} className="text-success" /> },
              { id: 'PT-5531', time: '2 hrs ago', text: 'Consecutive Misses rule triggered (3 doses).', status: 'Added to Priority Queue', icon: <TrendingDown size={12} /> },
            ].map((e) => (
              <div key={e.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ink">{e.id}</span>
                  <span className="text-xs text-body">{e.time}</span>
                </div>
                <p className="mt-0.5 text-sm text-body">{e.text}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-navy-light">
                  {e.icon}
                  {e.status}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-5 py-3 text-center">
            <button className="text-sm font-semibold text-navy-light">View All Escalations</button>
          </div>
        </div>
      </div>
    </div>
  );
}
