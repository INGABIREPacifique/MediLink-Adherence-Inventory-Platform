import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

// Matches "Data Request Submitted Successfully". FRONTEND ONLY.
export default function RequestSubmitted() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-white p-8 text-center shadow-sm">
      <span className="flex size-14 items-center justify-center rounded-full bg-success text-white"><CheckCircle2 size={28} /></span>
      <h1 className="text-xl font-bold text-ink">Data Request Submitted Successfully</h1>
      <p className="text-sm text-body">Your request has been sent to the Ministry's Oversight Committee for review. You'll be notified once a decision is made.</p>
      <div className="w-full rounded-lg bg-bg p-3 text-left text-xs text-body">
        <p><span className="font-semibold text-ink">Reference:</span> REQ-2024-RDH-0038</p>
      </div>
      <Link to="/public/requests" className="mt-2 w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white">Go to My Requests</Link>
    </div>
  );
}
