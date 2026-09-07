import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert, Lightbulb } from 'lucide-react';

// Matches Figma node 1:8147 "CHW Supervisor - Escalation Resolution
// Dashboard" -- complements the existing (real) Supervisor Dashboard
// (/supervisor, CHW roster + response-time KPIs) with an
// escalation-resolution-focused view: a queue nurses/admins work through,
// plus CHW workload balance and a reassignment suggestion.
// FRONTEND ONLY -- mock queue and workload data; the underlying
// escalation records are real elsewhere (Escalation Inbox), this is a
// new lens on them, not a new data source.
const METRICS = [
  { label: 'Active Escalations', value: '24', trend: '+3 since yesterday', tone: 'danger' as const },
  { label: 'Avg Resolution', value: '4.2h', trend: '-0.5h from avg', tone: 'default' as const },
  { label: '% Resolved < 24h', value: '86%', trend: 'On target', tone: 'default' as const },
  { label: 'High-Risk Patients', value: '8', trend: 'Requires review', tone: 'warning' as const },
];

const QUEUE = [
  { patient: 'Mugisha, J.', id: 'PT-8921', type: 'High Temp Alert', elapsed: '2h 15m', status: 'Worker Dispatched', urgent: true },
  { patient: 'Uwimana, C.', id: 'PT-7732', type: '3+ Missed Doses', elapsed: '12h 40m', status: 'Contact Attempted', urgent: false },
  { patient: 'Bizimana, E.', id: 'PT-1104', type: 'Missed Appointment', elapsed: '24h+', status: 'Resolution Proposed', urgent: false, resolved: true },
];

const CHW_WORKLOAD = [
  { initials: 'AK', name: 'Alice K.', zone: 'Zone 4', active: 7, efficiency: '92%', over: true },
  { initials: 'DN', name: 'David N.', zone: 'Zone 1', active: 3, efficiency: '88%', over: false },
];

const statusStyles: Record<string, string> = {
  'Worker Dispatched': 'bg-warning-bg text-warning-text',
  'Contact Attempted': 'bg-bg text-body',
  'Resolution Proposed': 'bg-success-bg text-success-text',
};

export default function ChwSupervisorEscalationDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Escalation Management</h1>
          <p className="text-body">Kigali Sector — Supervisor View</p>
        </div>
        <Link to="/supervisor" className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-navy-light shadow-sm">
          CHW Roster Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className={`rounded-lg border p-5 shadow-sm ${m.tone === 'danger' ? 'border-danger/30 bg-danger-bg/40' : m.tone === 'warning' ? 'border-warning/30 bg-warning-bg/40' : 'border-border bg-white'}`}
          >
            <p className={`flex items-center gap-1.5 text-xs font-semibold uppercase ${m.tone === 'danger' ? 'text-danger-text' : m.tone === 'warning' ? 'text-warning-text' : 'text-body'}`}>
              {m.tone === 'danger' && <AlertTriangle size={13} />}
              {m.tone === 'warning' && <ShieldAlert size={13} />}
              {m.label}
            </p>
            <p className={`mt-1 text-3xl font-bold ${m.tone === 'danger' ? 'text-danger-text' : m.tone === 'warning' ? 'text-warning-text' : 'text-ink'}`}>{m.value}</p>
            <p className={`mt-1 text-xs font-semibold ${m.tone === 'danger' ? 'text-danger-text' : 'text-success-text'}`}>{m.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-4">
            <h3 className="font-bold text-ink">Active Resolution Queue</h3>
            <span className="rounded-full bg-danger-bg px-3 py-1 text-xs font-semibold text-danger-text">{QUEUE.length} Pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-body">
                <tr><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Elapsed</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
              </thead>
              <tbody>
                {QUEUE.map((q) => (
                  <tr key={q.id} className={`border-b border-border last:border-0 ${q.urgent ? 'bg-danger-bg/20' : ''}`}>
                    <td className="px-4 py-3"><p className="text-sm font-semibold text-ink">{q.patient}</p><p className="text-xs text-body">ID: {q.id}</p></td>
                    <td className={`px-4 py-3 text-sm ${q.urgent ? 'font-semibold text-danger-text' : 'text-ink'}`}>{q.type}</td>
                    <td className={`px-4 py-3 text-sm ${q.urgent ? 'font-bold text-danger-text' : 'text-ink'}`}>{q.elapsed}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[q.status]}`}>{q.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button className={`rounded px-3 py-1.5 text-xs font-semibold text-white ${q.resolved ? 'bg-success' : 'bg-navy'}`}>{q.resolved ? 'Approve' : 'Review'}</button>
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
          {CHW_WORKLOAD.map((c) => (
            <div key={c.initials} className="flex items-center justify-between rounded border border-border bg-bg p-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white">{c.initials}</span>
                <div><p className="text-sm font-semibold text-ink">{c.name}</p><p className="text-xs text-body">{c.zone}</p></div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${c.over ? 'text-danger-text' : 'text-ink'}`}>{c.active} Active</p>
                <p className="flex items-center gap-1 text-xs text-success-text"><CheckCircle2 size={11} /> {c.efficiency} Eff.</p>
              </div>
            </div>
          ))}
          <div className="rounded border border-navy/20 bg-[#d7e2ff]/30 p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-navy"><Lightbulb size={15} /> Optimization Suggestion</p>
            <p className="mt-1 text-sm text-body">Alice K. is currently over capacity (7 active). Consider reassigning Zone 4 cases to David N.</p>
            <button className="mt-2 w-full rounded bg-navy py-2 text-sm font-semibold text-white">Review Reassignments</button>
          </div>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-body"><Clock size={12} /> Reflects the same escalation records as the Escalation Inbox — this is a resolution-workflow view, not a separate data source.</p>
    </div>
  );
}
