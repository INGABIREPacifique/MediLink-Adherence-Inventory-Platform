import { useEffect, useState } from 'react';
import { Users, ShieldCheck, Clock, CalendarClock } from 'lucide-react';
import { getSupervisorOverview, getChwRoster, type SupervisorOverview, type ChwRosterRow } from '../services/supabaseSupervisorService';
import { getAuditLog, type AuditEntry } from '../services/supabaseAuditService';

const statusStyles: Record<ChwRosterRow['status'], string> = {
  excellent: 'bg-success-bg text-success-text',
  good: 'bg-[#d7e2ff] text-navy',
  review: 'bg-warning-bg text-warning-text',
  critical: 'bg-danger-bg text-danger-text',
};

// Matches Figma "CHW Supervisor Dashboard" content: KPI row + Recent
// Activity + CHW Performance Roster. The Regional Adherence Heatmap in
// the Figma design is intentionally not built -- see comment in
// supabaseSupervisorService.ts for why.
export default function SupervisorDashboard() {
  const [overview, setOverview] = useState<SupervisorOverview | null>(null);
  const [roster, setRoster] = useState<ChwRosterRow[]>([]);
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSupervisorOverview(), getChwRoster(), getAuditLog()]).then(([o, r, a]) => {
      setOverview(o);
      setRoster(r);
      setActivity(a.slice(0, 4));
      setLoading(false);
    });
  }, []);

  if (loading || !overview) return <div className="text-body">Loading supervisor dashboard…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Supervisor Dashboard</h1>
        <p className="text-body">CHW performance and workload across the facility.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Users size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Active CHWs</p></div>
          <p className="mt-1 text-2xl font-bold text-ink">{overview.totalActiveChws}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-success-text"><ShieldCheck size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Patient Adherence</p></div>
          <p className="mt-1 text-2xl font-bold text-success-text">{overview.patientAdherencePct}%</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Clock size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Avg Response Time</p></div>
          <p className="mt-1 text-2xl font-bold text-ink">{overview.avgResponseHours}<span className="text-sm font-normal"> hrs</span></p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-navy"><CalendarClock size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Pending Visits</p></div>
          <p className="mt-1 text-2xl font-bold text-navy">{overview.pendingVisits}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-bold text-ink">Recent Activity</h3>
        </div>
        {activity.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-body">No activity logged yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {activity.map((a) => (
              <div key={a.id} className="px-5 py-3 text-sm text-ink">
                <span className="font-semibold">{a.actor}</span> — {a.summary} for {a.patientName}
                <p className="text-xs text-body">{new Date(a.at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-bold text-ink">CHW Performance Roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr>
                <th className="px-5 py-3">CHW Name</th>
                <th className="px-5 py-3">Assigned Patients</th>
                <th className="px-5 py-3">Visits Logged</th>
                <th className="px-5 py-3">Open Escalations</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-body">No CHWs registered yet.</td></tr>
              ) : (
                roster.map((r, i) => (
                  <tr key={r.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                    <td className="px-5 py-3 text-sm font-semibold text-ink">{r.name}</td>
                    <td className="px-5 py-3 text-sm text-body">{r.assignedPatients}</td>
                    <td className="px-5 py-3 text-sm text-body">{r.visitsLogged}</td>
                    <td className="px-5 py-3 text-sm text-body">{r.openEscalations}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[r.status]}`}>{r.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
