import { useEffect, useState } from 'react';
import { Truck, ShieldCheck, ThermometerSnowflake, ClipboardList, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getNextPendingDelivery, completeDeliveryReceipt, getLatestReadingForBatch, type DeliveryBatch, type ColdChainReading } from '../services/supabasePharmacyLogisticsService';

// Matches Figma nodes 1:6447 "Delivery Receipt - Incoming Batch", 1:6541
// "Integrity Check", 1:6659 "Log Discrepancies", 1:6722 "Success" -- a
// single linear flow (CHW/pharmacy staff receiving a cold-chain shipment),
// built as one stepper component rather than four separate routes since
// the four Figma screens are one continuous transaction, not independent
// destinations a user navigates back to.
//
// Real data as of migration 0017 (deliveries + cold_chain_readings):
// loads the oldest pending delivery, pulls its latest real temperature
// reading, and writes the actual receipt outcome back on submit. The
// Integrity Check step's design (per Figma node 1:6541) disables
// "Confirm Integrity" during a genuine thermal alert and only allows
// "Report Issue" -- this now reflects a real reading instead of a
// hardcoded always-OK state.

type Step = 'loading' | 'empty' | 'incoming' | 'integrity' | 'discrepancies' | 'success';

export default function DeliveryReceipt() {
  const [step, setStep] = useState<Step>('loading');
  const [batch, setBatch] = useState<DeliveryBatch | null>(null);
  const [reading, setReading] = useState<ColdChainReading | null>(null);
  const [checklist, setChecklist] = useState({ sealIntact: false, quantityMatches: false, packagingUndamaged: false });
  const [actualQuantity, setActualQuantity] = useState('');
  const [damagedItems, setDamagedItems] = useState(false);
  const [notes, setNotes] = useState('');
  const [accepted, setAccepted] = useState(true);

  function loadBatch() {
    setStep('loading');
    getNextPendingDelivery().then(async (b) => {
      setBatch(b);
      setActualQuantity(b ? String(b.expectedQuantity) : '');
      setChecklist({ sealIntact: false, quantityMatches: false, packagingUndamaged: false });
      setDamagedItems(false);
      setNotes('');
      setReading(b ? await getLatestReadingForBatch(b.batchReference) : null);
      setStep(b ? 'incoming' : 'empty');
    });
  }

  useEffect(loadBatch, []);

  const thermalOk = reading ? reading.withinRange : true; // no reading logged yet -- nothing to flag, not the same as confirmed-safe

  async function submitReceipt(finalChecklist: typeof checklist, finalNotes: string) {
    if (!batch) return;
    const isAccepted = Object.values(finalChecklist).every(Boolean);
    setAccepted(isAccepted);
    await completeDeliveryReceipt(batch.id, {
      actualQuantity: Number(actualQuantity) || batch.expectedQuantity,
      sealIntact: finalChecklist.sealIntact,
      quantityMatches: finalChecklist.quantityMatches,
      packagingUndamaged: finalChecklist.packagingUndamaged,
      discrepancyNotes: finalNotes || undefined,
    });
    setStep('success');
  }

  if (step === 'loading') {
    return <p className="text-body">Loading next delivery…</p>;
  }

  if (step === 'empty') {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-ink">Delivery Receipt</h1>
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 rounded-lg border border-border bg-white p-8 text-center shadow-sm">
          <Truck size={28} className="text-body" />
          <p className="font-semibold text-ink">No deliveries awaiting receipt</p>
          <p className="text-sm text-body">New incoming batches from Replenishment Approval will appear here once dispatched.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Delivery Receipt</h1>
        <p className="text-body">Receiving {batch!.batchReference}, source: {batch!.sourceHub}.</p>
      </div>

      <div className="mx-auto w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-sm">
        {step === 'incoming' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy"><Truck size={20} /></span>
                <div>
                  <p className="font-bold text-ink">{batch!.batchReference}</p>
                  <p className="text-sm text-body">Cold Chain Requirement: 2°C – 8°C</p>
                </div>
              </div>
              <span className="rounded bg-warning-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-warning-text">Expected Today</span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
              <div><p className="text-xs font-semibold uppercase text-body">Source Hub</p><p className="font-semibold text-ink">{batch!.sourceHub}</p></div>
              <div><p className="text-xs font-semibold uppercase text-body">Expected Qty</p><p className="font-semibold text-ink">{batch!.expectedQuantity} Vials</p></div>
              <div><p className="text-xs font-semibold uppercase text-body">Dispatched At</p><p className="font-semibold text-ink">{batch!.dispatchedAt ? new Date(batch!.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p></div>
              <div><p className="text-xs font-semibold uppercase text-body">Driver</p><p className="font-semibold text-ink">{batch!.driverName ?? '—'}</p></div>
            </div>
            <button onClick={() => setStep('integrity')} className="rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white">
              Start Receipt Process
            </button>
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-body">Requires Temperature Log Verification</p>
          </div>
        )}

        {step === 'integrity' && (
          <div className="flex flex-col gap-5">
            {!thermalOk && (
              <div className="flex gap-3 rounded-lg border border-danger bg-danger p-4 text-white">
                <ThermometerSnowflake size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Thermal Excursion Detected</p>
                  <p className="text-sm opacity-90">Temperature exceeded the safe threshold during transit. Do not administer until cleared.</p>
                </div>
              </div>
            )}
            <p className="flex items-center gap-2 text-lg font-bold text-navy"><ShieldCheck size={18} /> Thermal Integrity Status</p>
            <div className={`rounded-lg p-4 text-center ${thermalOk ? 'bg-success-bg' : 'bg-danger-bg'}`}>
              {reading ? (
                <>
                  <p className={`text-3xl font-bold ${thermalOk ? 'text-success-text' : 'text-danger'}`}>{reading.temperatureCelsius}°C</p>
                  <p className={`mt-1 text-sm font-bold ${thermalOk ? 'text-success-text' : 'text-danger-text'}`}>
                    {thermalOk ? 'Within cold chain range throughout transit' : 'Alert: Above Safe Threshold'}
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-body">No temperature reading logged yet for this batch.</p>
              )}
            </div>
            <p className="text-xs font-semibold uppercase text-body">Physical Inspection</p>
            {[
              { key: 'sealIntact' as const, label: 'Batch Seal Intact', hint: 'Check for any tampering on main cooler' },
              { key: 'quantityMatches' as const, label: 'Quantity Matches', hint: `Verify ${batch!.expectedQuantity} vials present upon opening` },
              { key: 'packagingUndamaged' as const, label: 'Packaging Undamaged', hint: 'No crushed boxes or leaked fluids' },
            ].map(({ key, label, hint }) => (
              <label key={key} className={`flex items-start gap-3 rounded border border-border bg-bg p-3 ${!thermalOk ? 'opacity-50' : ''}`}>
                <input type="checkbox" disabled={!thermalOk} checked={checklist[key]} onChange={(e) => setChecklist((c) => ({ ...c, [key]: e.target.checked }))} className="mt-0.5" />
                <span><span className="block text-sm font-semibold text-ink">{label}</span><span className="block text-xs text-body">{hint}</span></span>
              </label>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setStep('incoming')} className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-body"><ArrowLeft size={14} /> Back</button>
              {!thermalOk ? (
                <button onClick={() => setStep('discrepancies')} className="flex-1 rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white">Report Issue</button>
              ) : (
                <button
                  onClick={() => (Object.values(checklist).every(Boolean) ? submitReceipt(checklist, '') : setStep('discrepancies'))}
                  className="flex-1 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {Object.values(checklist).every(Boolean) ? 'Confirm Receipt' : 'Report Discrepancy Instead'}
                </button>
              )}
            </div>
            {!thermalOk && <p className="text-center text-xs text-body">Confirmation disabled due to thermal alert.</p>}
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
              <button onClick={() => submitReceipt(checklist, damagedItems ? `Damaged items reported. ${notes}` : notes)} className="flex-1 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white">Submit Report</button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-success-bg text-success"><CheckCircle2 size={32} /></span>
            <p className="text-2xl font-bold text-ink">Receipt Recorded</p>
            <p className="max-w-sm text-sm text-body">
              {batch!.batchReference} has been {accepted ? 'accepted into stock' : 'logged with a discrepancy report'}.
            </p>
            <button onClick={loadBatch} className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">Receive Another Batch</button>
          </div>
        )}
      </div>
    </div>
  );
}
