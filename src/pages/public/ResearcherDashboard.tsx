import { Plus, MessageCircle } from 'lucide-react';

// Matches "My Data Requests" (Researcher Dashboard). FRONTEND ONLY.
const requests = [
  { title: 'Antimalarial Mortality Trends 2018-2023', status: 'Approved', date: 'Nov 2, 2023' },
  { title: 'Infectious Disease Spatial Mapping', status: 'In Review', date: 'Nov 8, 2023' },
  { title: 'Pediatric Malnutrition Interventions', status: 'Pending', date: 'Nov 10, 2023' },
];

const statusStyles: Record<string, string> = {
  Approved: 'bg-success-bg text-success-text',
  'In Review': 'bg-warning-bg text-warning-text',
  Pending: 'bg-row-alt text-body',
};

export default function ResearcherDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold text-ink">My Data Requests</h1>
        <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"><Plus size={15} />New Request</button>
      </div>

      <div className="flex flex-col gap-3">
        {requests.map((r) => (
          <div key={r.title} className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink">{r.title}</p>
                <p className="text-xs text-body">Submitted {r.date}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[r.status]}`}>{r.status}</span>
            </div>
            {r.status === 'In Review' && (
              <div className="mt-2 flex items-center gap-1.5 rounded bg-bg p-2 text-xs text-body">
                <MessageCircle size={12} />
                Oversight committee has requested clarification -- reply via message thread.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
