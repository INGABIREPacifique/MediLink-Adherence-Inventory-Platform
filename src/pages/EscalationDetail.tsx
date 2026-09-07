import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Pill, Clock, Phone, Navigation, ClipboardList, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

// Matches Figma node 1:7884 "Escalation Detail - Missed Doses" -- a
// full-page drill-down for a single high-priority escalation, distinct
// from the compact Escalation Inbox row. FRONTEND ONLY -- mock detail;
// wiring to real escalation data (already real in the Escalation Inbox)
// is the backend follow-up once this shape is confirmed.
const MOCK_ESCALATION = {
  patientName: 'Jean-Baptiste Mukasa',
  patientId: 'RWA-772-91B',
  location: 'Kigali Sector, Village 4, House 12A',
  regimen: 'Amoxicillin 500mg (3x daily)',
  missedCount: 3,
  hoursSinceLastDose: 36,
  timeline: [
    { day: 'T-7', taken: true }, { day: 'T-6', taken: true }, { day: 'T-5', taken: true }, { day: 'T-4', taken: true },
    { day: 'T-3', taken: false }, { day: 'T-2', taken: false }, { day: 'T-1', taken: false },
  ],
};

export default function EscalationDetail() {
  const { escalationId } = useParams<{ escalationId: string }>();
  const e = MOCK_ESCALATION;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="flex w-fit items-center gap-2 text-sm font-semibold text-navy-light">
        <ArrowLeft size={15} /> Back to Escalations
      </Link>

      <div className="rounded-lg bg-danger p-5 text-white shadow-sm">
        <p className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
          <AlertTriangle size={20} /> High Priority Intervention
        </p>
        <p className="mt-1 text-sm opacity-90">Immediate follow-up required. Patient at high risk of treatment failure.{escalationId ? ` (Escalation ${escalationId})` : ''}</p>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-xl bg-bg text-body text-lg font-bold">
            {e.patientName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </span>
          <div>
            <p className="text-xl font-bold text-ink">{e.patientName}</p>
            <p className="text-sm text-body">ID: #{e.patientId}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <MapPin size={16} className="mt-0.5 text-body" />
            <div><p className="text-xs font-semibold uppercase text-body">Location</p><p className="text-sm text-ink">{e.location}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Pill size={16} className="mt-0.5 text-body" />
            <div><p className="text-xs font-semibold uppercase text-body">Current Regimen</p><p className="text-sm text-ink">{e.regimen}</p></div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-danger/30 bg-danger-bg/40 p-6">
        <p className="text-2xl font-bold text-danger-text">{e.missedCount} Consecutive Misses</p>
        <p className="mt-2 text-sm text-danger-text">
          Patient has failed to log their {e.regimen.split(' ')[0]} doses for {e.missedCount} consecutive periods. Protocol requires immediate physical or verbal verification.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-danger/20 px-3 py-1 text-xs font-semibold text-danger-text">
          <Clock size={12} /> Time since last dose: {e.hoursSinceLastDose}h
        </span>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between">
          <div><p className="text-lg font-bold text-ink">Adherence History</p><p className="text-sm text-body">Past 7 Days</p></div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          {e.timeline.map((t) => (
            <div key={t.day} className="flex flex-col items-center gap-2">
              <span className={`flex size-8 items-center justify-center rounded-full border-2 border-white ${t.taken ? 'bg-success' : 'bg-danger'}`}>
                {t.taken ? <CheckCircle2 size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
              </span>
              <span className={`text-xs font-semibold ${t.taken ? 'text-body' : 'text-danger-text'}`}>{t.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white"><Phone size={15} /> Call Patient</button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success px-4 py-3 text-sm font-semibold text-success-text"><Navigation size={15} /> Navigate to Patient</button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-ink"><ClipboardList size={15} /> Log Visit</button>
      </div>
    </div>
  );
}
