import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Pill, Clock, Phone, Navigation, ClipboardList, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { supabaseAlertsService } from '../services/supabaseAlertsService';
import { supabase } from '../lib/supabaseClient';
import type { EscalationAlert } from '../types';

// Matches Figma node 1:7884 "Escalation Detail - Missed Doses" -- a
// full-page drill-down for a single high-priority escalation, distinct
// from the compact Escalation Inbox row. Real data: the escalation itself
// (migration 0001, same source as the Escalation Inbox), and a real
// 7-day dose-confirmation timeline for that patient. "Navigate to
// Patient" stays honestly disabled -- no real GPS/location data exists
// in this pilot, same reasoning as the Patient Map screen. "Log Visit"
// writes a real chw_visits row.
interface TimelinePoint {
  day: string;
  taken: boolean | null; // null = no dose scheduled that day
}

export default function EscalationDetail() {
  const { escalationId } = useParams<{ escalationId: string }>();
  const [alert, setAlert] = useState<EscalationAlert | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitLogged, setVisitLogged] = useState(false);

  useEffect(() => {
    if (!escalationId) return;
    supabaseAlertsService.getAlerts().then(async (all) => {
      const found = all.find((a) => a.id === escalationId) ?? null;
      setAlert(found);
      if (found?.patient.id) {
        const { data: prescriptions } = await supabase.from('prescriptions').select('id').eq('patient_id', found.patient.id);
        const prescriptionIds = (prescriptions ?? []).map((p) => p.id);
        const points: TimelinePoint[] = [];
        for (let i = 6; i >= 0; i--) {
          const dayStart = new Date();
          dayStart.setDate(dayStart.getDate() - i);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          if (prescriptionIds.length === 0) {
            points.push({ day: `T-${i}`, taken: null });
            continue;
          }
          const { data: doses } = await supabase
            .from('dose_reminders')
            .select('confirmed')
            .in('prescription_id', prescriptionIds)
            .gte('scheduled_for', dayStart.toISOString())
            .lt('scheduled_for', dayEnd.toISOString());
          const rows = doses ?? [];
          points.push({ day: i === 0 ? 'Today' : `T-${i}`, taken: rows.length === 0 ? null : rows.every((d) => d.confirmed) });
        }
        setTimeline(points);
      }
      setLoading(false);
    });
  }, [escalationId]);

  async function logVisit() {
    if (!alert) return;
    await supabase.from('chw_visits').insert({ patient_id: alert.patient.id, escalation_id: alert.id, outcome: 'visited' });
    setVisitLogged(true);
  }

  const hoursSinceLastDose = alert ? Math.round((Date.now() - new Date(alert.missedAt).getTime()) / (1000 * 60 * 60)) : 0;

  if (loading) return <p className="text-body">Loading…</p>;
  if (!alert) return <p className="text-body">Escalation not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="flex w-fit items-center gap-2 text-sm font-semibold text-navy-light">
        <ArrowLeft size={15} /> Back to Escalations
      </Link>

      <div className="rounded-lg bg-danger p-5 text-white shadow-sm">
        <p className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
          <AlertTriangle size={20} /> {alert.aiPriority === 'critical' ? 'High Priority Intervention' : 'Follow-Up Required'}
        </p>
        <p className="mt-1 text-sm opacity-90">{alert.aiReasoning ?? 'Patient requires follow-up.'}</p>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-xl bg-bg text-body text-lg font-bold">
            {alert.patient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </span>
          <div>
            <p className="text-xl font-bold text-ink">{alert.patient.name}</p>
            <p className="text-sm text-body">{alert.patient.phone}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <MapPin size={16} className="mt-0.5 text-body" />
            <div><p className="text-xs font-semibold uppercase text-body">Location</p><p className="text-sm text-body">No location data recorded for this pilot</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Pill size={16} className="mt-0.5 text-body" />
            <div><p className="text-xs font-semibold uppercase text-body">Current Regimen</p><p className="text-sm text-ink">{alert.medication}</p></div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-6">
        <p className="text-2xl font-bold text-danger-text">{alert.phase || 'Missed Dose'}</p>
        <p className="mt-2 text-sm text-danger-text">
          Escalation triggered for {alert.medication}. Protocol requires immediate physical or verbal verification.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-danger/20 px-3 py-1 text-xs font-semibold text-danger-text">
          <Clock size={12} /> Time since flagged: {hoursSinceLastDose}h
        </span>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between">
          <div><p className="text-lg font-bold text-ink">Adherence History</p><p className="text-sm text-body">Past 7 Days</p></div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          {timeline.map((t) => (
            <div key={t.day} className="flex flex-col items-center gap-2">
              <span className={`flex size-8 items-center justify-center rounded-full border-2 border-white ${t.taken === null ? 'bg-bg' : t.taken ? 'bg-success' : 'bg-danger'}`}>
                {t.taken === null ? null : t.taken ? <CheckCircle2 size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
              </span>
              <span className={`text-xs font-semibold ${t.taken === false ? 'text-danger-text' : 'text-body'}`}>{t.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={`tel:${alert.patient.phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white"><Phone size={15} /> Call Patient</a>
        <button disabled title="No real location data in this pilot" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-body opacity-50"><Navigation size={15} /> Navigate to Patient</button>
        <button onClick={logVisit} disabled={visitLogged} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success px-4 py-3 text-sm font-semibold text-success-text disabled:opacity-60"><ClipboardList size={15} /> {visitLogged ? 'Visit Logged' : 'Log Visit'}</button>
      </div>
    </div>
  );
}
