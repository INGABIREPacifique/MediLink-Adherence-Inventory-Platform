import { useEffect, useState } from 'react';
import { CheckCircle2, Calendar, Pill } from 'lucide-react';
import { getPatientHistory } from '../../services/supabasePatientHistoryService';
import { getDischargeSummary, type DischargeSummaryData } from '../../services/supabaseDischargeService';
import { supabase } from '../../lib/supabaseClient';

// Real data via the same DEMO_PATIENT_ID pattern used in
// PatientDischargeSummary/PatientMedications, until real patient
// phone+OTP login exists (see migration 0021, schema prep only).
const DEMO_PATIENT_ID = '44444444-4444-4444-4444-444444444444'; // Chantal Iribagiza, seeded with a full dose history

export default function PatientDashboard() {
  const [patientName, setPatientName] = useState('');
  const [adherenceRatePct, setAdherenceRatePct] = useState(0);
  const [summary, setSummary] = useState<DischargeSummaryData | null>(null);
  const [nextFollowUp, setNextFollowUp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPatientHistory(DEMO_PATIENT_ID),
      getDischargeSummary(DEMO_PATIENT_ID),
      supabase.from('appointments').select('scheduled_for').eq('patient_id', DEMO_PATIENT_ID).gte('scheduled_for', new Date().toISOString().slice(0, 10)).order('scheduled_for', { ascending: true }).limit(1).maybeSingle(),
    ]).then(([history, dischargeSummary, appt]) => {
      setPatientName(history.patient.name);
      setAdherenceRatePct(history.patient.adherenceRatePct);
      setSummary(dischargeSummary);
      setNextFollowUp(appt.data?.scheduled_for ?? null);
      setLoading(false);
    });
  }, []);

  const takenToday = summary?.medications.filter((m) => m.completed).length ?? 0;
  const totalToday = summary?.medications.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">{loading ? 'Good morning!' : `Good morning, ${patientName.split(' ')[0]}!`}</h1>
        <p className="text-body">Here's how your treatment is going.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-success/30 bg-success-bg/40 p-5">
          <div className="flex items-center gap-2 text-success-text">
            <CheckCircle2 size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Adherence Rate</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-success-text">{loading ? '—' : `${adherenceRatePct}%`}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-navy">
            <Pill size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Medications</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : `${takenToday} of ${totalToday}`}</p>
          <p className="text-xs text-body">Courses completed</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-navy">
            <Calendar size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Next Follow-up</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : nextFollowUp ? new Date(nextFollowUp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'None scheduled'}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold text-ink">Your Current Medications</h2>
        <div className="flex flex-col divide-y divide-border">
          {loading && <p className="py-3 text-sm text-body">Loading…</p>}
          {!loading && (summary?.medications.length ?? 0) === 0 && <p className="py-3 text-sm text-body">No medications on record.</p>}
          {summary?.medications.map((m) => (
            <div key={m.name} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-ink">{m.name}</p>
                <p className="text-xs text-body">{m.dosage} — {m.frequency}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.completed ? 'bg-success-bg text-success-text' : 'bg-warning-bg text-warning-text'}`}>
                {m.completed ? 'Course completed' : 'In progress'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
