import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle2, ArrowLeft, Minus, Plus } from 'lucide-react';
import { createReplenishmentRequest } from '../services/supabasePharmacyLogisticsService';

// Matches Figma nodes 1:7268 "Select Items", 1:7132 "Review & Submit",
// 1:7078 "Success" -- a nurse/pharmacy staff member requesting restock,
// distinct from the existing Replenishment Approval page (that's the
// admin approving requests; this is the requesting side).
// Real write as of migration 0017 (replenishment_requests +
// replenishment_request_items).
const CATALOGUE = [
  { name: 'Amoxicillin 250mg Capsules', unit: 'boxes', category: 'Medications', badge: 'Essential' as const },
  { name: 'Paracetamol 500mg', unit: 'boxes', category: 'Medications', badge: 'Out of Stock at Depot' as const },
  { name: 'Insulin (Regular)', unit: 'vials', category: 'Medications', badge: 'Cold Chain' as const },
  { name: 'Oral Rehydration Salts (ORS)', unit: 'sachets', category: 'Medications', badge: 'Essential' as const },
  { name: 'Malaria RDT Kits', unit: 'kits', category: 'Diagnostics', badge: 'Low Stock' as const },
];

const badgeStyles: Record<string, string> = {
  Essential: 'bg-[#d7e2ff] text-navy',
  'Low Stock': 'bg-warning-bg text-warning-text',
  'Cold Chain': 'bg-navy text-white',
  'Out of Stock at Depot': 'bg-danger-bg text-danger-text',
};

type Step = 'select' | 'review' | 'success';

export default function ReplenishmentRequest() {
  const [step, setStep] = useState<Step>('select');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReference, setSubmittedReference] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All Items' | 'Medications' | 'Diagnostics'>('All Items');

  const visibleCatalogue = CATALOGUE.filter(
    (item) => (activeTab === 'All Items' || item.category === activeTab) && item.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItems = CATALOGUE.filter((item) => (quantities[item.name] ?? 0) > 0);

  function setQty(name: string, delta: number) {
    setQuantities((q) => ({ ...q, [name]: Math.max(0, (q[name] ?? 0) + delta) }));
  }

  async function submit() {
    setSubmitting(true);
    const reasonLabels: Record<string, string> = {
      low_stock: 'Running Low on Stock',
      stockout: 'Stockout — Immediate Need',
      upcoming_demand: 'Anticipated Increase in Demand',
      other: 'Other',
    };
    const combinedNote = [reason ? `Reason: ${reasonLabels[reason]}` : null, note || null].filter(Boolean).join(' — ');
    const { reference } = await createReplenishmentRequest({
      items: selectedItems.map((item) => ({ itemName: item.name, quantity: quantities[item.name], unit: item.unit })),
      urgency,
      note: combinedNote || undefined,
    });
    setSubmittedReference(reference);
    setSubmitting(false);
    setStep('success');
  }

  if (step === 'success') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-white p-8 text-center shadow-sm">
        <span className="flex size-16 items-center justify-center rounded-full bg-success-bg text-success"><CheckCircle2 size={32} /></span>
        <p className="text-2xl font-bold text-ink">Request Submitted</p>
        <p className="text-sm text-body">
          Your request {submittedReference} has been sent to Kigali Central Medical Stores for approval.
        </p>
        <div className="w-full rounded-lg border border-border bg-bg p-4 text-left">
          <p className="mb-2 text-xs font-semibold uppercase text-body">Request Summary</p>
          {selectedItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-1 text-sm">
              <span className="text-ink">{item.name}</span>
              <span className="text-body">Qty {quantities[item.name]}</span>
            </div>
          ))}
        </div>
        <div className="flex w-full gap-2">
          <Link to="/chw/request-status" className="flex-1 rounded-lg bg-navy px-5 py-2.5 text-center text-sm font-semibold text-white">View Request Status</Link>
          <button onClick={() => { setStep('select'); setQuantities({}); setNote(''); setUrgency('routine'); }} className="flex-1 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-body">Back to Inventory</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Replenishment Request</h1>
        <p className="text-body">{step === 'select' ? 'Select items and quantities needed.' : 'Review before submitting.'}</p>
      </div>

      {step === 'select' && (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medications, kits, or supplies..."
            className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-ink shadow-sm"
          />
          <div className="flex gap-2">
            {(['All Items', 'Medications', 'Diagnostics'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${activeTab === tab ? 'bg-navy text-white' : 'border border-border bg-white text-body'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-white shadow-sm">
            {visibleCatalogue.length === 0 && <p className="px-5 py-6 text-center text-sm text-body">No items match your search.</p>}
            {visibleCatalogue.map((item) => (
              <div key={item.name} className="flex items-center justify-between border-b border-border px-5 py-4 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy"><Package size={16} /></span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${badgeStyles[item.badge]}`}>{item.badge}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setQty(item.name, -1)} className="flex size-8 items-center justify-center rounded border border-border text-body"><Minus size={14} /></button>
                  <span className="w-10 text-center text-sm font-semibold text-ink">{quantities[item.name] ?? 0}</span>
                  <button type="button" onClick={() => setQty(item.name, 1)} className="flex size-8 items-center justify-center rounded border border-border text-body"><Plus size={14} /></button>
                  <span className="w-14 text-xs text-body">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            disabled={selectedItems.length === 0}
            onClick={() => setStep('review')}
            className="ml-auto rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Review Request ({selectedItems.length})
          </button>
        </div>
      )}

      {step === 'review' && (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-5 rounded-lg border border-border bg-white p-6 shadow-sm">
          <p className="text-lg font-bold text-navy">Review Request</p>
          <div className="flex flex-col gap-2">
            {selectedItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded border border-border bg-bg px-3 py-2">
                <span className="text-sm font-semibold text-ink">{item.name}</span>
                <span className="text-sm text-body">{quantities[item.name]} {item.unit}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Urgency
            <div className="flex gap-2">
              {(['routine', 'urgent'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize ${urgency === u ? (u === 'urgent' ? 'border-danger bg-danger-bg text-danger-text' : 'border-navy bg-[#d7e2ff] text-navy') : 'border-border text-body'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Reason for Request
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-lg border border-border bg-bg px-3 py-2.5 text-ink">
              <option value="" disabled>Select a reason…</option>
              <option value="low_stock">Running Low on Stock</option>
              <option value="stockout">Stockout — Immediate Need</option>
              <option value="upcoming_demand">Anticipated Increase in Demand</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Additional Notes (optional)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Add any specific delivery instructions or context..." className="rounded border border-border bg-bg px-3 py-2 text-ink" />
          </label>
          <div className="flex gap-3">
            <button onClick={() => setStep('select')} className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-body"><ArrowLeft size={14} /> Back</button>
            <button onClick={submit} disabled={submitting || !reason} className="flex-1 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Request'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
