import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRequestsByEmail, type ResearchDataRequestRow } from '../../services/supabaseResearchService';

// Matches "My Data Requests" (Researcher Dashboard). Real data as of
// migration 0020 -- looked up by email since this portal has no real
// login yet, same "no auth on this tier" design as the rest of
// Public/Research.
const statusStyles: Record<string, string> = {
  approved: 'bg-success-bg text-success-text',
  under_review: 'bg-warning-bg text-warning-text',
  submitted: 'bg-row-alt text-body',
  rejected: 'bg-danger-bg text-danger-text',
};

const statusLabels: Record<string, string> = { approved: 'Approved', under_review: 'In Review', submitted: 'Pending', rejected: 'Rejected' };

export default function ResearcherDashboard() {
  const [email, setEmail] = useState('');
  const [requests, setRequests] = useState<ResearchDataRequestRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const rows = await getRequestsByEmail(email);
    setRequests(rows);
    setSearched(true);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold text-ink">My Data Requests</h1>
        <Link to="/public/data-access-request" className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"><Plus size={15} />New Request</Link>
      </div>

      <form onSubmit={lookup} className="flex gap-2">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter the email you used to submit requests" className="flex-1 rounded border border-border px-3 py-2 text-sm text-ink" />
        <button type="submit" disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Search size={14} />{loading ? 'Looking up…' : 'Look Up'}</button>
      </form>

      <div className="flex flex-col gap-3">
        {searched && requests.length === 0 && <p className="text-sm text-body">No requests found for that email.</p>}
        {requests.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink">{r.datasetRequested}</p>
                <p className="text-xs text-body">Submitted {new Date(r.submittedAt).toLocaleDateString()}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[r.status] ?? statusStyles.submitted}`}>{statusLabels[r.status] ?? r.status}</span>
            </div>
            {r.decisionNote && <div className="mt-2 rounded bg-bg p-2 text-xs text-body">{r.decisionNote}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
