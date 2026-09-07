import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Phone, Footprints, Package } from 'lucide-react';

// Matches Figma node 1:8020 "CHW Tasks & Escalations List" -- a CHW's
// unified task queue, distinct from the nurse-side Escalation Inbox.
// FRONTEND ONLY -- mock task list.
const CRITICAL = [
  { id: 'esc-1', name: 'Jean-Baptiste Mukasa', priority: 'High', when: '2 hrs ago', distance: '1.2 km', note: 'Missed 3 consecutive TB treatment doses. Immediate home visit required.' },
];

const ROUTINE = [
  { priority: 'Routine', when: 'Today', title: 'Marie Claire Uwase', note: 'Maternal health check — Month 7', distance: '0.8 km', icon: MapPin },
  { priority: 'Routine', when: 'Tomorrow', title: 'Inventory Check', note: 'Update stock levels for Rapid Malaria Tests', distance: null, icon: Package },
  { priority: 'Medium', when: 'Tomorrow', title: 'Eric Ndayishimiye', note: 'Follow up on fever symptoms reported', distance: '3.5 km', icon: MapPin },
];

const priorityBadge: Record<string, string> = {
  Routine: 'bg-bg text-ink',
  Medium: 'bg-warning-bg text-warning-text',
};

export default function ChwTasksList() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Tasks &amp; Alerts</h1>
          <p className="text-body">{CRITICAL.length + ROUTINE.length} active items</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-danger-text">
          <AlertTriangle size={13} /> Critical Escalations
        </p>
        {CRITICAL.map((c) => (
          <div key={c.id} className="relative overflow-hidden rounded-lg border border-danger/30 bg-white p-4 shadow-sm">
            <span className="absolute inset-y-0 left-0 w-1 bg-danger" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-danger-bg px-2 py-0.5 text-xs font-bold text-danger-text">{c.priority}</span>
                <span className="text-xs font-semibold text-body">{c.when}</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-body"><MapPin size={12} /> {c.distance}</span>
            </div>
            <p className="mt-2 text-lg font-bold text-ink">{c.name}</p>
            <p className="text-sm text-body">{c.note}</p>
            <div className="mt-3 flex gap-2">
              <Link to={`/escalation/${c.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded bg-navy px-3 py-2 text-xs font-semibold text-white">
                <Footprints size={13} /> Start Visit
              </Link>
              <button type="button" className="flex items-center justify-center rounded border border-border px-3 py-2"><Phone size={14} className="text-body" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-body">Routine Follow-Up</p>
        {ROUTINE.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.title} className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${priorityBadge[r.priority]}`}>{r.priority.toUpperCase()}</span>
                    <span className="text-xs font-semibold text-body">{r.when}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink">{r.title}</p>
                  <p className="text-sm text-body">{r.note}</p>
                </div>
                {r.distance && <span className="flex items-center gap-1 text-xs font-semibold text-body"><Icon size={12} /> {r.distance}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
