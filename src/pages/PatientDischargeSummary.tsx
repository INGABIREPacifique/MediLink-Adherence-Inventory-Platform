import { useState } from 'react';
import type { DischargeSummary } from '../types';

// Issued at the end of the monitoring period. Populated from
// dose_reminders + appointments + escalations once wired to real data —
// mock summary shown here so the layout/fields are agreed before backend wiring.
const mockSummary: DischargeSummary = {
  patient: { id: 'p-4', name: 'Chantal Iribagiza', phone: '+250 781 222 333' },
  monitoringPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  monitoringPeriodEnd: new Date().toISOString(),
  adherenceRatePct: 91,
  totalEscalations: 2,
  followUpsAttended: 3,
  followUpsScheduled: 3,
  notes: 'Full course completed. No relapse indicators at final follow-up.',
};

export default function PatientDischargeSummary() {
  const [summary] = useState<DischargeSummary>(mockSummary);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-base text-ink">Patient Discharge Summary</h2>
        <p className="text-base text-body">Adherence & follow-up outcome for the monitoring period.</p>
      </div>

      <div className="max-w-2xl rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-lg font-semibold text-ink">{summary.patient.name}</p>
            <p className="text-sm text-body">{summary.patient.phone}</p>
          </div>
          <p className="text-sm text-body">
            {new Date(summary.monitoringPeriodStart).toLocaleDateString()} — {new Date(summary.monitoringPeriodEnd).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-body">Adherence Rate</p>
            <p className="text-2xl font-bold text-ink">{summary.adherenceRatePct}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-body">Escalations</p>
            <p className="text-2xl font-bold text-danger">{summary.totalEscalations}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-body">Follow-ups Attended</p>
            <p className="text-2xl font-bold text-ink">{summary.followUpsAttended}/{summary.followUpsScheduled}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-body">Notes</p>
          <p className="text-sm text-ink">{summary.notes}</p>
        </div>
      </div>
    </div>
  );
}
