import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Matches "Research Data Application" form. FRONTEND ONLY -- submit just
// navigates to the confirmation screen, no real request is stored yet
// (that's a real approval workflow -- Ministry side, backend phase).
export default function DataAccessRequest() {
  const [step] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg rounded-lg border border-border bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-body">Step {step} of 3: Project Details</p>
      <h1 className="mt-1 text-xl font-bold text-ink">Research Data Application</h1>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-row-alt"><div className="h-full w-1/3 bg-navy" /></div>

      <form onSubmit={(e) => { e.preventDefault(); navigate('/public/request-submitted'); }} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Project Title
          <input required placeholder="e.g. Regional TB Treatment Outcomes 2024" className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Research Summary
          <textarea required rows={4} placeholder="Describe your research objective..." className="rounded border border-border p-3 text-base font-normal text-ink" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Requesting Institution
          <input required placeholder="e.g. University of Rwanda" className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>
        <button type="submit" className="mt-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white">Continue to Dataset Selection</button>
      </form>
    </div>
  );
}
