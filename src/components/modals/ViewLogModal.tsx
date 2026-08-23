import { X, Phone, User, MessageSquare } from 'lucide-react';
import type { EscalationAlert } from '../../types';

interface Props {
  alert: EscalationAlert;
  onClose: () => void;
}

const methodIcon = { phone: Phone, in_person: User, sms: MessageSquare };

// Read-only view of a resolved escalation's follow-up history -- backs the
// "View Log" link, which previously did nothing even though the data
// (alert.followUpLogs) was already being fetched from Supabase.
export function ViewLogModal({ alert, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Follow-Up Log</h3>
            <p className="text-sm text-body">{alert.patient.name} — {alert.medication}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-body hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col divide-y divide-border px-6 py-2">
          {(!alert.followUpLogs || alert.followUpLogs.length === 0) ? (
            <p className="py-6 text-center text-sm text-body">No follow-up entries logged for this case.</p>
          ) : (
            alert.followUpLogs.map((log) => {
              const Icon = methodIcon[log.method];
              return (
                <div key={log.id} className="flex gap-3 py-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d7e2ff] text-navy">
                    <Icon size={13} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {log.loggedBy} <span className="font-normal text-body">— {log.outcome.replace(/_/g, ' ')}</span>
                    </p>
                    {log.notes && <p className="text-sm text-body">{log.notes}</p>}
                    <p className="mt-0.5 text-xs text-body">{new Date(log.loggedAt).toLocaleString()}</p>
                  </div>
                </div>
              );
            })
          )}
          {alert.resolutionNote && (
            <div className="py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-body">Resolution Note</p>
              <p className="text-sm text-ink">{alert.resolutionNote}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border px-6 py-4">
          <button onClick={onClose} className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
