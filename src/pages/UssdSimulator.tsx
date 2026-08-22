import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import {
  getPendingDoses, confirmDose, getPendingAppointments, confirmAppointment,
  type PendingDose, type PendingAppointment,
} from '../services/supabaseUssdService';

// Matches Figma node 1:1146 "Appointment Screen" / node 1:882 "USSD
// Interaction Flow" -- literal feature-phone USSD screen mockups (dark
// phone frame, dot-matrix message text, numeric keypad). This is a real
// stand-in for the proposal's "Patient Interface Layer" (USSD gateway),
// which this pilot has no telecom credentials to integrate for real.
// Confirming here writes to the actual dose_reminders/appointments tables
// and can trigger the same auto-escalation engine as a real patient would.
type Screen =
  | { kind: 'menu' }
  | { kind: 'dose'; dose: PendingDose }
  | { kind: 'appointment'; appt: PendingAppointment }
  | { kind: 'confirmed'; message: string };

export default function UssdSimulator() {
  const [doses, setDoses] = useState<PendingDose[]>([]);
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [screen, setScreen] = useState<Screen>({ kind: 'menu' });
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [d, a] = await Promise.all([getPendingDoses(), getPendingAppointments()]);
    setDoses(d);
    setAppointments(a);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleConfirmDose(dose: PendingDose) {
    await confirmDose(dose.id);
    setScreen({ kind: 'confirmed', message: `Murakoze! ${dose.medication} dose confirmed.` });
    refresh();
  }

  async function handleConfirmAppointment(appt: PendingAppointment) {
    await confirmAppointment(appt.id);
    setScreen({ kind: 'confirmed', message: 'Murakoze! Appointment confirmed.' });
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">USSD Simulator</h1>
        <p className="max-w-2xl text-body">
          Stands in for the real USSD/telecom gateway (proposal §6, Patient Interface Layer) — no telecom
          integration exists yet for this pilot. Confirming a dose or appointment here writes to the real
          database, exactly like a patient pressing "1" on their phone would.
        </p>
      </div>

      <div className="flex flex-wrap gap-8">
        {/* Phone frame */}
        <div className="w-[220px] shrink-0 rounded-[28px] border-8 border-ink bg-ink p-2 shadow-xl">
          <div className="flex min-h-[200px] flex-col justify-between rounded-lg bg-[#dfe6d8] p-3 font-mono text-[11px] text-[#1a2e1a]">
            {loading ? (
              <p>Loading…</p>
            ) : screen.kind === 'menu' ? (
              <>
                <p className="font-bold">MediLink: Reminder</p>
                {doses.length > 0 ? (
                  <>
                    <p>Your {doses[0].medication} dose was scheduled for {new Date(doses[0].scheduledFor).toLocaleTimeString()}.</p>
                    <p className="mt-2">1. Emeza (Confirm)</p>
                    <button onClick={() => setScreen({ kind: 'dose', dose: doses[0] })} className="mt-3 w-full rounded bg-white px-2 py-1 text-left">
                      1 &gt; Continue
                    </button>
                  </>
                ) : appointments.length > 0 ? (
                  <>
                    <p>Your follow-up at Kigali Central is on {new Date(appointments[0].scheduledFor).toLocaleDateString()}.</p>
                    <p className="mt-2">1. Emeza (Confirm)</p>
                    <button onClick={() => setScreen({ kind: 'appointment', appt: appointments[0] })} className="mt-3 w-full rounded bg-white px-2 py-1 text-left">
                      1 &gt; Continue
                    </button>
                  </>
                ) : (
                  <p>No pending reminders. Murakoze!</p>
                )}
              </>
            ) : screen.kind === 'dose' ? (
              <>
                <p className="font-bold">Confirm dose?</p>
                <p>{screen.dose.medication} — {screen.dose.patientName}</p>
                <button onClick={() => handleConfirmDose(screen.dose)} className="mt-3 w-full rounded bg-white px-2 py-1 text-left">
                  1 &gt; Emeza (Confirm)
                </button>
                <button onClick={() => setScreen({ kind: 'menu' })} className="mt-1 w-full rounded bg-white px-2 py-1 text-left">
                  0 &gt; Back
                </button>
              </>
            ) : screen.kind === 'appointment' ? (
              <>
                <p className="font-bold">Confirm appointment?</p>
                <p>{screen.appt.patientName} — {new Date(screen.appt.scheduledFor).toLocaleDateString()}</p>
                <button onClick={() => handleConfirmAppointment(screen.appt)} className="mt-3 w-full rounded bg-white px-2 py-1 text-left">
                  1 &gt; Emeza (Confirm)
                </button>
                <button onClick={() => setScreen({ kind: 'menu' })} className="mt-1 w-full rounded bg-white px-2 py-1 text-left">
                  0 &gt; Back
                </button>
              </>
            ) : (
              <>
                <p className="font-bold">{screen.message}</p>
                <button onClick={() => setScreen({ kind: 'menu' })} className="mt-3 w-full rounded bg-white px-2 py-1 text-left">
                  0 &gt; Menu
                </button>
              </>
            )}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
              <div key={k} className="flex items-center justify-center rounded bg-[#2a2f3a] py-1.5 text-xs font-semibold text-white">
                {k}
              </div>
            ))}
          </div>
        </div>

        {/* Queue lists */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-ink">
              <Phone size={14} />
              Pending Dose Confirmations ({doses.length})
            </h3>
            {doses.length === 0 ? (
              <p className="text-sm text-body">None pending.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm text-body">
                {doses.map((d) => (
                  <li key={d.id}>{d.patientName} — {d.medication} ({new Date(d.scheduledFor).toLocaleString()})</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-bold text-ink">Pending Appointment Confirmations ({appointments.length})</h3>
            {appointments.length === 0 ? (
              <p className="text-sm text-body">None pending.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm text-body">
                {appointments.map((a) => (
                  <li key={a.id}>{a.patientName} — {new Date(a.scheduledFor).toLocaleDateString()}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
