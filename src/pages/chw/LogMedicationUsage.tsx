import { useState } from 'react';
import { CheckCircle2, ClipboardList } from 'lucide-react';

// Matches Figma nodes 1:6925 "Log Medication Usage - Form" and 1:7030
// "Usage Recorded - Success" -- a CHW logging what they dispensed during a
// home visit, distinct from the nurse's Staff Registration enrollment flow.
// FRONTEND ONLY -- mock patient/medication/batch lists; wiring this to
// inventoryService.logUsage (already real, used elsewhere) is the backend
// follow-up once this shape is confirmed.
const MOCK_PATIENTS = ['Chantal Iribagiza', 'Jean Bosco Nkurunziza', 'Marie Uwase'];
const MOCK_MEDICATIONS = ['Amoxicillin 500mg', 'Paracetamol 500mg', 'Artemether/Lumefantrine'];
const MOCK_BATCHES: Record<string, string[]> = {
  'Amoxicillin 500mg': ['BX-2201', 'BX-2214'],
  'Paracetamol 500mg': ['BX-1187'],
  'Artemether/Lumefantrine': ['BX-3390'],
};

export default function LogMedicationUsage() {
  const [submitted, setSubmitted] = useState(false);
  const [patient, setPatient] = useState('');
  const [medication, setMedication] = useState('');
  const [batch, setBatch] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [doseObserved, setDoseObserved] = useState(true);

  function reset() {
    setSubmitted(false);
    setPatient('');
    setMedication('');
    setBatch('');
    setQuantity('1');
    setDoseObserved(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-white p-8 text-center shadow-sm">
        <span className="flex size-16 items-center justify-center rounded-full bg-success-bg text-success"><CheckCircle2 size={32} /></span>
        <p className="text-2xl font-bold text-ink">Usage Recorded</p>
        <p className="text-sm text-body">
          {quantity} unit(s) of {medication} logged for {patient}{doseObserved ? ' — dose observed directly.' : '.'}
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
        onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-lg border border-border bg-white p-6 shadow-sm"
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Patient
          <select required value={patient} onChange={(e) => setPatient(e.target.value)} className="rounded border border-border bg-bg px-3 py-2.5 text-ink">
            <option value="" disabled>Select Patient</option>
            {MOCK_PATIENTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Medication
          <select required value={medication} onChange={(e) => { setMedication(e.target.value); setBatch(''); }} className="rounded border border-border bg-bg px-3 py-2.5 text-ink">
            <option value="" disabled>Select medication</option>
            {MOCK_MEDICATIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Quantity Distributed
            <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="rounded border border-border bg-bg px-3 py-2 text-ink" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Batch Number
            <select required value={batch} onChange={(e) => setBatch(e.target.value)} disabled={!medication} className="rounded border border-border bg-bg px-3 py-2 text-ink disabled:opacity-50">
              <option value="" disabled>Select batch</option>
              {(MOCK_BATCHES[medication] ?? []).map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
        </div>
        <label className="flex items-center justify-between rounded border border-border bg-bg p-3">
          <span><span className="block text-sm font-semibold text-ink">Dose Observed</span><span className="block text-xs text-body">Did you watch the patient take this dose?</span></span>
          <input type="checkbox" checked={doseObserved} onChange={(e) => setDoseObserved(e.target.checked)} />
        </label>
        <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white">
          <ClipboardList size={16} /> Log Usage
        </button>
      </form>
    </div>
  );
}
