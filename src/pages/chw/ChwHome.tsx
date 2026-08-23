import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarCheck, Users, Phone, Footprints } from 'lucide-react';
import { getChwOverview, getPriorityTasks, logChwVisit, type ChwOverview } from '../../services/supabaseChwService';
import type { EscalationAlert } from '../../types';

// Matches Figma node 1:2014 "CHW Field App - Home" content (Today's
// Overview stat cards, Priority Tasks list with Call/Start Visit actions)
// reskinned for the shared desktop shell instead of the mobile bottom-tab
// layout Figma shows, per direction: same desktop app, role-based content.
export default function ChwHome() {
  const [overview, setOverview] = useState<ChwOverview | null>(null);
  const [tasks, setTasks] = useState<EscalationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  async function refresh() {
    const [o, t] = await Promise.all([getChwOverview(), getPriorityTasks()]);
    setOverview(o);
    setTasks(t);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleStartVisit(task: EscalationAlert) {
    setLoggingId(task.id);
    try {
      await logChwVisit(task.patient.id, 'visited', `Follow-up visit for ${task.medication} escalation.`, task.id);
      await refresh();
    } finally {
      setLoggingId(null);
    }
  }

  if (loading || !overview) return <div className="text-body">Loading overview…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Today's Overview</h1>
        <p className="text-body">Here is your summary for today, {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-danger/30 bg-danger-bg/60 p-5">
          <div className="flex items-center gap-2 text-danger-text">
            <AlertTriangle size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Urgent Visits</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-danger-text">{overview.urgentVisitsCount}</p>
          <p className="text-xs text-danger-text">Requires immediate attention</p>
        </div>
        <div className="rounded-lg border border-success/30 bg-success-bg/50 p-5">
          <div className="flex items-center gap-2 text-success-text">
            <CalendarCheck size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Follow-ups</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-success-text">{overview.followUpsTodayCount}</p>
          <p className="text-xs text-success-text">Scheduled for today</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body">
            <Users size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Total Patients</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-navy">{overview.totalPatientsCount}</p>
          <p className="text-xs text-body">Enrolled at this facility</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Priority Tasks</h2>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-lg border border-border bg-white p-6 text-center text-sm text-body">No active tasks right now.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d7e2ff] text-sm font-bold text-navy">
                    {task.patient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">
                      <Link to={`/patients/${task.patient.id}`} className="hover:text-navy-light hover:underline">{task.patient.name}</Link>
                    </p>
                    <p className="text-xs text-body">{task.patient.phone}</p>
                  </div>
                </div>
                {task.aiPriority && (
                  <span className="rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text">
                    {task.aiPriority}
                  </span>
                )}
              </div>

              <div className="mt-3 rounded-lg bg-bg p-3 text-sm text-ink">
                <p className="font-semibold text-body">Reason for escalation:</p>
                <p>{task.aiReasoning ?? `Missed ${task.medication} dose confirmation (${task.phase}).`}</p>
              </div>

              <div className="mt-3 flex gap-2">
                <a
                  href={`tel:${task.patient.phone}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-semibold text-body"
                >
                  <Phone size={14} />
                  Call
                </a>
                <button
                  onClick={() => handleStartVisit(task)}
                  disabled={loggingId === task.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  <Footprints size={14} />
                  {loggingId === task.id ? 'Logging…' : 'Start Visit'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
