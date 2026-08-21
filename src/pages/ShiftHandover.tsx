import { useEffect, useState } from 'react';
import { AlertTriangle, Package, Phone, CheckCircle2 } from 'lucide-react';
import { handoverService } from '../services';

// Matches Figma node 1:11423 "MVP Nurse Shift Handover - Ward Status":
// Unresolved Escalations table (patient/bed, medication, missed-by, action),
// Critical Stock panel with reorder badges, Outgoing Shift Notes, and an
// Acknowledge & Start Shift button -- richer than a plain form.
const unresolvedEscalations = [
  { patient: 'Jean Bosco Ndoli', bed: 'Bed 12-A', medication: 'Amoxicillin 500mg', missedBy: '4 hours', urgent: true },
  { patient: 'Marie Claire Uwineza', bed: 'Bed 04-C', medication: 'Metformin 850mg', missedBy: '2.5 hours', urgent: false },
  { patient: 'Eric Habimana', bed: 'Bed 18-B', medication: 'Ibuprofen 400mg', missedBy: '1 hour', urgent: false },
];

const criticalStock = [
  { name: 'Ceftriaxone 1g', current: '5 vials' },
  { name: 'Saline 0.9% 500ml', current: '12 bags' },
];

export default function ShiftHandover() {
  const [snapshot, setSnapshot] = useState<{ pendingEscalationsCount: number; lowStockItemsCount: number } | null>(null);
  const [notes, setNotes] = useState(
    '- Bed 12-A (J. Bosco) had a slight fever spike at 02:00, resolved with paracetamol. Monitor closely.\n- IV pump on Bed 04-C needs maintenance, reported to biomed.\n- Waiting on lab results for Bed 18-B before administering next dose of antibiotics.'
  );
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    handoverService.getPendingSnapshot().then(setSnapshot);
  }, []);

  async function handleAcknowledge() {
    await handoverService.submitHandover(notes, 'Nurse A. Kamali', 'Incoming Staff');
    setAcknowledged(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg border border-border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-ink">Nurse Daily Handover</h1>
          <p className="text-sm text-body">Internal Medicine Ward · Night to Morning Shift (07:00 – 15:00)</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-body">Incoming Staff</p>
          <p className="text-sm font-semibold text-ink">N. Mutoni, D. Rukundo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <AlertTriangle size={16} className="text-danger" />
              Unresolved Escalations
            </h3>
            <span className="rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text">
              {snapshot?.pendingEscalationsCount ?? unresolvedEscalations.length} Pending
            </span>
          </div>
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr>
                <th className="px-5 py-2">Patient</th>
                <th className="px-5 py-2">Medication</th>
                <th className="px-5 py-2">Missed By</th>
                <th className="px-5 py-2">Action Required</th>
              </tr>
            </thead>
            <tbody>
              {unresolvedEscalations.map((e) => (
                <tr key={e.patient} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-ink">{e.patient}</p>
                    <p className="text-xs text-body">{e.bed}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-body">{e.medication}</td>
                  <td className={`px-5 py-3 text-sm font-semibold ${e.urgent ? 'text-danger' : 'text-body'}`}>{e.missedBy}</td>
                  <td className="px-5 py-3">
                    <button className="flex items-center gap-1.5 text-sm font-semibold text-navy-light">
                      <Phone size={13} />
                      Follow-up Call
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <Package size={16} className="text-navy" />
              Critical Stock
            </h3>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {criticalStock.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-warning-text/30 bg-warning-bg/40 p-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs text-body">Current: {item.current}</p>
                </div>
                <span className="rounded bg-[#624800] px-2 py-1 text-xs font-semibold text-warning-text">Reorder</span>
              </div>
            ))}
            <button className="mt-2 rounded-lg border border-border py-2 text-sm font-semibold text-body">
              View Full Inventory
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-bold text-ink">Outgoing Shift Notes</h3>
        </div>
        <div className="p-5">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border bg-bg p-3 text-sm text-ink"
          />
          <p className="mt-2 text-xs text-body">Logged by: <span className="font-semibold text-ink">Nurse A. Kamali (Night Shift)</span></p>
        </div>
      </div>

      <div className="flex justify-end">
        {acknowledged ? (
          <p className="rounded-lg border border-success/30 bg-success-bg/40 px-4 py-2.5 text-sm font-semibold text-success-text">
            Handover acknowledged and logged.
          </p>
        ) : (
          <button
            onClick={handleAcknowledge}
            className="flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-light"
          >
            <CheckCircle2 size={16} />
            Acknowledge & Start Shift
          </button>
        )}
      </div>
    </div>
  );
}
