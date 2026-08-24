import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { getFeedback, getFeedbackOverview, submitFeedback, type FeedbackEntry, type FeedbackOverview } from '../services/supabaseFeedbackService';

const categoryLabels: Record<FeedbackEntry['category'], string> = {
  workflow_friction: 'Workflow Friction',
  system_bug: 'System Bug',
  feature_request: 'Feature Request',
};

const statusStyles: Record<FeedbackEntry['status'], string> = {
  under_review: 'bg-warning-bg text-warning-text',
  planned: 'bg-[#d7e2ff] text-navy',
  resolved: 'bg-success-bg text-success-text',
};

// Matches Figma "Pilot Feedback & Iteration Log" content (category
// breakdown, status counts, searchable table) -- reskinned into this app's
// own staff shell rather than the mockup's separate public-site branding.
// Explicitly named for the 3-month pilot period itself -- was a real gap,
// nothing collected structured feedback before this.
export default function PilotFeedbackLog() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [overview, setOverview] = useState<FeedbackOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackEntry['category']>('workflow_friction');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  async function refresh() {
    const [e, o] = await Promise.all([getFeedback(), getFeedbackOverview()]);
    setEntries(e);
    setOverview(o);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await submitFeedback(category, description);
    setDescription('');
    setCategory('workflow_friction');
    setModalOpen(false);
    await refresh();
    setSubmitting(false);
  }

  const filtered = entries.filter((e) => e.description.toLowerCase().includes(search.toLowerCase()));

  if (loading || !overview) return <div className="text-body">Loading feedback log…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Pilot Feedback &amp; Iteration Log</h1>
          <p className="text-body">Log workflow friction, bugs, or suggestions to improve clinical data management.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
          <Plus size={15} />
          New Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-ink">Feedback Overview</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Workflow Friction', pct: overview.workflowFrictionPct, color: 'bg-navy' },
              { label: 'System Bugs', pct: overview.systemBugsPct, color: 'bg-danger' },
              { label: 'Feature Requests', pct: overview.featureRequestsPct, color: 'bg-success' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs font-semibold text-body">
                  <span>{row.label}</span>
                  <span>{row.pct}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-row-alt">
                  <div className={`h-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4 text-center">
            <div className="rounded-lg bg-row-alt p-3">
              <p className="text-2xl font-bold text-ink">{overview.underReviewCount}</p>
              <p className="text-xs text-body">Under Review</p>
            </div>
            <div className="rounded-lg bg-row-alt p-3">
              <p className="text-2xl font-bold text-ink">{overview.plannedCount}</p>
              <p className="text-xs text-body">Planned</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <div className="border-b border-border p-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback…"
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-ink"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
                <tr>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-body">No feedback logged yet.</td></tr>
                ) : (
                  filtered.map((e, i) => (
                    <tr key={e.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                      <td className="px-4 py-3 text-sm font-semibold text-ink">{e.reporterName}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-row-alt px-2 py-1 text-xs font-semibold text-body">{categoryLabels[e.category]}</span>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-sm text-body">{e.description}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[e.status]}`}>
                          {e.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-body">{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-ink">New Feedback</h3>
              <button onClick={() => setModalOpen(false)} aria-label="Close" className="rounded p-1 text-body hover:bg-black/5">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
                Category
                <select value={category} onChange={(e) => setCategory(e.target.value as FeedbackEntry['category'])} className="rounded border border-border px-3 py-2 text-base font-normal text-ink">
                  <option value="workflow_friction">Workflow Friction</option>
                  <option value="system_bug">System Bug</option>
                  <option value="feature_request">Feature Request</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
                Description
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="rounded border border-border p-3 text-base font-normal text-ink" />
              </label>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-body">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50">
                  {submitting ? 'Saving…' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
