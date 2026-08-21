import { useEffect, useState } from 'react';
import { handoverService } from '../services';

export default function ShiftHandover() {
  const [snapshot, setSnapshot] = useState<{ pendingEscalationsCount: number; lowStockItemsCount: number } | null>(null);
  const [notes, setNotes] = useState('');
  const [outgoing, setOutgoing] = useState('');
  const [incoming, setIncoming] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    handoverService.getPendingSnapshot().then(setSnapshot);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await handoverService.submitHandover(notes, outgoing, incoming);
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-base text-ink">Nurse Shift Handover</h2>
        <p className="text-base text-body">Review pending items before ending your shift.</p>
      </div>

      <div className="flex max-w-xl gap-4">
        <div className="flex-1 rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-body">Pending Escalations</p>
          <span className="text-[32px] font-bold leading-none text-danger">{snapshot?.pendingEscalationsCount ?? '—'}</span>
        </div>
        <div className="flex-1 rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-body">Low Stock Items</p>
          <span className="text-[32px] font-bold leading-none text-warning-text">{snapshot?.lowStockItemsCount ?? '—'}</span>
        </div>
      </div>

      {submitted ? (
        <p className="max-w-xl rounded-lg border border-success/30 bg-success-bg/40 p-4 text-sm font-semibold text-success-text">
          Handover acknowledged and logged.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4 rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold text-body">
              Outgoing nurse
              <input value={outgoing} onChange={(e) => setOutgoing(e.target.value)} required
                className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
            </label>
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold text-body">
              Incoming nurse
              <input value={incoming} onChange={(e) => setIncoming(e.target.value)} required
                className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Handover notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              placeholder="Anything the incoming nurse needs to know…"
              className="rounded border border-border p-3 text-base font-normal text-ink" />
          </label>
          <button type="submit" className="mt-1 w-fit rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
            Acknowledge & Complete Handover
          </button>
        </form>
      )}
    </div>
  );
}
