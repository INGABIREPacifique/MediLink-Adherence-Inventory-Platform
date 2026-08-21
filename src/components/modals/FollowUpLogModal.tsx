import { useState } from 'react';
import { X } from 'lucide-react';
import type { EscalationAlert, FollowUpLogEntry } from '../../types';

interface Props {
  alert: EscalationAlert;
  onClose: () => void;
  onSubmit: (entry: Omit<FollowUpLogEntry, 'id' | 'alertId' | 'loggedAt'>) => Promise<void>;
}

// Nurse Escalation - Follow-Up Log Modal. Logs the human outcome of a nurse
// following up on an escalation (proposal §4.1: "Nurses follow up via phone
// and log outcomes"). Fully rule-based -- no AI here, just structured logging.
export function FollowUpLogModal({ alert, onClose, onSubmit }: Props) {
  const [method, setMethod] = useState<FollowUpLogEntry['method']>('phone');
  const [outcome, setOutcome] = useState<FollowUpLogEntry['outcome']>('confirmed_taken');
  const [notes, setNotes] = useState('');
  const [loggedBy, setLoggedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ loggedBy, method, outcome, notes });
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Log Follow-Up</h3>
            <p className="text-sm text-body">{alert.patient.name} — {alert.medication}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-body hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Nurse name
            <input required value={loggedBy} onChange={(e) => setLoggedBy(e.target.value)}
              className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Contact method
            <select value={method} onChange={(e) => setMethod(e.target.value as FollowUpLogEntry['method'])}
              className="rounded border border-border px-3 py-2 text-base font-normal text-ink">
              <option value="phone">Phone call</option>
              <option value="in_person">In person</option>
              <option value="sms">SMS</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Outcome
            <select value={outcome} onChange={(e) => setOutcome(e.target.value as FollowUpLogEntry['outcome'])}
              className="rounded border border-border px-3 py-2 text-base font-normal text-ink">
              <option value="confirmed_taken">Confirmed dose taken</option>
              <option value="confirmed_missed">Confirmed dose missed</option>
              <option value="unreachable">Unreachable</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="rounded border border-border p-3 text-base font-normal text-ink" />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-body">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50">
              {submitting ? 'Saving…' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
