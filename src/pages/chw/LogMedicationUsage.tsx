import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import { logMedicationUsage } from '../../services/supabasePharmacyLogisticsService';
import { getAllPatients } from '../../services/supabasePatientHistoryService';
import { supabaseInventoryService } from '../../services/supabaseInventoryService';

// Matches Figma nodes 1:6925 "Log Medication Usage - Form" and 1:7030
// "Usage Recorded - Success" -- a CHW logging what they dispensed during a
// home visit, distinct from the nurse's Staff Registration enrollment flow.
// Real write as of migration 0017 (medication_usage_logs); patient and
// medication lists now pulled from real data instead of hardcoded arrays.
export default function LogMedicationUsage() {
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [medication, setMedication] = useState('');
  const [batch, setBatch] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [doseObserved, setDoseObserved] = useState(true);

  useEffect(() => {
    Promise.all([getAllPatients(), supabaseInventoryService.getItems()])
      .then(([patientRows, items]) => {
        setPatients(patientRows.map((p) => ({ id: p.id, name: p.name })));
        setMedications(items.map((i) => i.name));
      })
      .finally(() => setLoadingLists(false));
  }, []);

  const patientName = patients.find((p) => p.id === patientId)?.name ?? '';

  function reset() {
    setSubmitted(false);
    setPatientId('');
    setMedication('');
    setBatch('');
    setQuantity('1');
    setDoseObserved(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await logMedicationUsage({
      patientId: patientId || null,
      itemName: medication,
      batchReference: batch || undefined,
      quantity: Number(quantity) || 1,
      doseObserved,
    });
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-white p-8 text-center shadow-sm">
        <span className="flex size-16 items-center justify-center rounded-full bg-success-bg text-success"><CheckCircle2 size={32} /></span>
        <p className="text-2xl font-bold text-ink">Usage Recorded</p>
        <p className="text-sm text-body">
          Usage successfully recorded for {patientName}.
        </p>
        <p className="text-sm text-body">
          {quantity} unit(s) of {medication}{doseObserved ? ' — dose observed directly.' : '.'}
        </p>
        <div className="flex gap-3">
          <button onClick={reset} className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">Log Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Log Medication Usage</h1>
        <p className="text-body">Record dispensing and adherence observation.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-lg border border-border bg-white p-6 shadow-sm"
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Patient
          <select required value={patientId} onChange={(e) => setPatientId(e.target.value)} disabled={loadingLists} className="rounded border border-border bg-bg px-3 py-2.5 text-ink disabled:opacity-50">
            <option value="" disabled>{loadingLists ? 'Loading…' : 'Select Patient'}</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Medication
          <select required value={medication} onChange={(e) => setMedication(e.target.value)} disabled={loadingLists} className="rounded border border-border bg-bg px-3 py-2.5 text-ink disabled:opacity-50">
            <option value="" disabled>{loadingLists ? 'Loading…' : 'Select medication'}</option>
            {medications.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Quantity Distributed
            <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="rounded border border-border bg-bg px-3 py-2 text-ink" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Batch Number
            <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. BX-2201" className="rounded border border-border bg-bg px-3 py-2 text-ink" />
          </label>
        </div>
        <label className="flex items-center justify-between rounded border border-border bg-bg p-3">
          <span><span className="block text-sm font-semibold text-ink">Dose Observed</span><span className="block text-xs text-body">Did you watch the patient take this dose?</span></span>
          <input type="checkbox" checked={doseObserved} onChange={(e) => setDoseObserved(e.target.checked)} />
        </label>
        <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
          <ClipboardList size={16} /> {submitting ? 'Recording…' : 'Confirm Usage'}
        </button>
      </form>
    </div>
  );
}
