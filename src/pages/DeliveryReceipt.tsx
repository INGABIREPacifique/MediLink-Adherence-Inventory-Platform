import { useState } from 'react';
import { Truck, ShieldCheck, ClipboardList, CheckCircle2, ArrowLeft } from 'lucide-react';

// Matches Figma nodes 1:6447 "Delivery Receipt - Incoming Batch", 1:6541
// "Integrity Check", 1:6659 "Log Discrepancies", 1:6722 "Success" -- a
// single linear flow (CHW/pharmacy staff receiving a cold-chain shipment),
// built as one stepper component rather than four separate routes since
// the four Figma screens are one continuous transaction, not independent
// destinations a user navigates back to.
//
// FRONTEND ONLY -- mock batch data, no backend wiring yet (matches the
// project's existing pattern: real cold-chain/thermal-audit data exists
// elsewhere, but this specific receiving workflow is new).
const MOCK_BATCH = {
  id: 'BX-8903',
  contents: 'Insulin Batch #BX-8903',
  coldChainRange: '2°C – 8°C',
  sourceHub: 'National Medical Store, Kigali',
  expectedQty: 50,
  dispatchedAt: 'Today, 06:40 AM',
  driver: 'Emmanuel Habimana',
};

type Step = 'incoming' | 'integrity' | 'discrepancies' | 'success';

export default function DeliveryReceipt() {
  const [step, setStep] = useState<Step>('incoming');
  const [checklist, setChecklist] = useState({ sealIntact: false, quantityMatches: false, packagingUndamaged: false });
  const [actualQuantity, setActualQuantity] = useState(String(MOCK_BATCH.expectedQty));
  const [damagedItems, setDamagedItems] = useState(false);
  const [notes, setNotes] = useState('');

  const thermalOk = true; // mock: real cold-chain sensor read would come from the existing Cold Chain Monitor feed

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Delivery Receipt</h1>
        <p className="text-body">Receiving {MOCK_BATCH.contents}, source: {MOCK_BATCH.sourceHub}.</p>
      </div>

      <div className="mx-auto w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-sm">
        {step === 'incoming' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy"><Truck size={20} /></span>
              <div>
                <p className="font-bold text-ink">{MOCK_BATCH.contents}</p>
                <p className="text-sm text-body">Cold Chain Requirement: {MOCK_BATCH.coldChainRange}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
              <div><p className="text-xs font-semibold uppercase text-body">Source Hub</p><p className="font-semibold text-ink">{MOCK_BATCH.sourceHub}</p></div>
              <div><p className="text-xs font-semibold uppercase text-body">Expected Qty</p><p className="font-semibold text-ink">{MOCK_BATCH.expectedQty} vials</p></div>
              <div><p className="text-xs font-semibold uppercase text-body">Dispatched At</p><p className="font-semibold text-ink">{MOCK_BATCH.dispatchedAt}</p></div>
              <div><p className="text-xs font-semibold uppercase text-body">Driver</p><p className="font-semibold text-ink">{MOCK_BATCH.driver}</p></div>
            </div>
            <button onClick={() => setStep('integrity')} className="rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white">
              Begin Receiving
            </button>
          </div>
        )}

        {step === 'integrity' && (
          <div className="flex flex-col gap-5">
            <p className="flex items-center gap-2 text-lg font-bold text-navy"><ShieldCheck size={18} /> Thermal Integrity Status</p>
            <div className={`rounded-lg p-4 text-center ${thermalOk ? 'bg-success-bg' : 'bg-danger-bg'}`}>
              <p className={`text-sm font-bold ${thermalOk ? 'text-success-text' : 'text-danger-text'}`}>
                {thermalOk ? 'Within cold chain range throughout transit' : 'Cold chain breach detected — escalate before accepting'}
              </p>
            </div>
            <p className="text-xs font-semibold uppercase text-body">Physical Inspection</p>
            {[
              { key: 'sealIntact' as const, label: 'Batch Seal Intact', hint: 'Check for any tampering on main cooler' },
              { key: 'quantityMatches' as const, label: 'Quantity Matches', hint: `Verify ${MOCK_BATCH.expectedQty} vials present upon opening` },
              { key: 'packagingUndamaged' as const, label: 'Packaging Undamaged', hint: 'No crushed boxes or leaked fluids' },
            ].map(({ key, label, hint }) => (
              <label key={key} className="flex items-start gap-3 rounded border border-border bg-bg p-3">
                <input type="checkbox" checked={checklist[key]} onChange={(e) => setChecklist((c) => ({ ...c, [key]: e.target.checked }))} className="mt-0.5" />
                <span><span className="block text-sm font-semibold text-ink">{label}</span><span className="block text-xs text-body">{hint}</span></span>
              </label>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setStep('incoming')} className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-body"><ArrowLeft size={14} /> Back</button>
              <button
                onClick={() => setStep(Object.values(checklist).every(Boolean) ? 'success' : 'discrepancies')}
                className="flex-1 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white"
              >
                {Object.values(checklist).every(Boolean) ? 'Confirm Receipt' : 'Report Discrepancy Instead'}
              </button>
            </div>
          </div>
        )}

        {step === 'discrepancies' && (
          <div className="flex flex-col gap-5">
            <p className="flex items-center gap-2 text-lg font-bold text-navy"><ClipboardList size={18} /> Log Discrepancies</p>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
              Actual Quantity Received
              <input value={actualQuantity} onChange={(e) => setActualQuantity(e.target.value)} type="number" className="rounded border border-border bg-bg px-3 py-2 text-ink" />
            </label>
            <label className="flex items-center justify-between rounded border border-border bg-bg p-3">
              <span><span className="block text-sm font-semibold text-ink">Damaged Items</span><span className="block text-xs text-body">Check if any boxes or kits are unusable.</span></span>
              <input type="checkbox" checked={damagedItems} onChange={(e) => setDamagedItems(e.target.checked)} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
              Receipt Notes
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Describe any discrepancies, damaged packaging, or other issues..." className="rounded border border-border bg-bg px-3 py-2 text-ink" />
            </label>
            <div className="flex gap-3">
              <button onClick={() => setStep('integrity')} className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-body"><ArrowLeft size={14} /> Back</button>
              <button onClick={() => setStep('success')} className="flex-1 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white">Submit Report</button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-success-bg text-success"><CheckCircle2 size={32} /></span>
            <p className="text-2xl font-bold text-ink">Receipt Recorded</p>
            <p className="max-w-sm text-sm text-body">
              {MOCK_BATCH.contents} has been {Object.values(checklist).every(Boolean) ? 'accepted into stock' : 'logged with a discrepancy report'}.
            </p>
            <button onClick={() => setStep('incoming')} className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">Receive Another Batch</button>
          </div>
        )}
      </div>
    </div>
  );
}
