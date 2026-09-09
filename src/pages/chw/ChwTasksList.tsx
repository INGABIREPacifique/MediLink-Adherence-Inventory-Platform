import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Phone, Footprints, Calendar } from 'lucide-react';
import { supabaseAlertsService } from '../../services/supabaseAlertsService';
import { supabase } from '../../lib/supabaseClient';
import type { EscalationAlert } from '../../types';

// Matches Figma node 1:8020 "CHW Tasks & Escalations List" -- a CHW's
// unified task queue, distinct from the nurse-side Escalation Inbox.
// Real data: critical section from pending escalations (migration 0001),
// routine section from upcoming appointments. Distance is dropped
// throughout -- no real location data exists in this pilot to compute it
// from, same reasoning as the Patient Map screen.
interface RoutineItem {
  id: string;
  patientName: string;
  scheduledFor: string;
}

export default function ChwTasksList() {
  const [critical, setCritical] = useState<EscalationAlert[]>([]);
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabaseAlertsService.getAlerts(),
      supabase
        .from('appointments')
        .select('id, scheduled_for, patients:patient_id ( name )')
        .eq('status', 'scheduled')
        .gte('scheduled_for', new Date().toISOString().slice(0, 10))
        .order('scheduled_for', { ascending: true })
        .limit(10),
    ]).then(([alerts, appts]) => {
      setCritical(alerts.filter((a) => a.status === 'pending' && (a.aiPriority === 'critical' || a.aiPriority === 'high')));
      const rows = (appts.data ?? []) as unknown as { id: string; scheduled_for: string; patients: { name: string } | null }[];
      setRoutine(rows.map((r) => ({ id: r.id, patientName: r.patients?.name ?? 'Unknown patient', scheduledFor: r.scheduled_for })));
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Tasks &amp; Alerts</h1>
          <p className="text-body">{loading ? '…' : critical.length + routine.length} active items</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-danger-text">
          <AlertTriangle size={13} /> Critical Escalations
        </p>
        {loading && <p className="text-sm text-body">Loading…</p>}
        {!loading && critical.length === 0 && <p className="text-sm text-body">No critical escalations right now.</p>}
        {critical.map((c) => (
          <div key={c.id} className="relative overflow-hidden rounded-lg border border-danger/30 bg-white p-4 shadow-sm">
            <span className="absolute inset-y-0 left-0 w-1 bg-danger" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-danger-bg px-2 py-0.5 text-xs font-bold text-danger-text capitalize">{c.aiPriority}</span>
                <span className="text-xs font-semibold text-body">{new Date(c.missedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="mt-2 text-lg font-bold text-ink">{c.patient.name}</p>
            <p className="text-sm text-body">{c.medication} — {c.phase || 'Missed dose'}. {c.aiReasoning ?? ''}</p>
            <div className="mt-3 flex gap-2">
              <Link to={`/escalation/${c.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded bg-navy px-3 py-2 text-xs font-semibold text-white">
                <Footprints size={13} /> Start Visit
              </Link>
              <a href={`tel:${c.patient.phone}`} className="flex items-center justify-center rounded border border-border px-3 py-2"><Phone size={14} className="text-body" /></a>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-body">Upcoming Appointments</p>
        {loading && <p className="text-sm text-body">Loading…</p>}
        {!loading && routine.length === 0 && <p className="text-sm text-body">No upcoming appointments.</p>}
        {routine.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-bg px-2 py-0.5 text-xs font-bold text-ink">ROUTINE</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-body"><Calendar size={12} /> {new Date(r.scheduledFor).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="mt-1 text-sm font-semibold text-ink">{r.patientName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
