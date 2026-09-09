import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitDataAccessRequest } from '../../services/supabaseResearchService';

// Matches "Research Data Application" form. Real write as of migration
// 0020 -- previously submit just navigated to the confirmation screen
// with nothing stored. Simplified to one step (name/email/institution/
// purpose) rather than a 3-step wizard with a separate dataset-selection
// screen that doesn't exist yet as a real catalogue to pick from.
export default function DataAccessRequest() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await submitDataAccessRequest({
        researcherName: String(form.get('name')),
        email: String(form.get('email')),
        institution: String(form.get('institution') || '') || undefined,
        purpose: String(form.get('purpose')),
        datasetRequested: String(form.get('title')),
      });
      navigate('/public/request-submitted');
    } catch {
      setError('Something went wrong submitting your request. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-lg border border-border bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-body">Research Data Application</p>
      <h1 className="mt-1 text-xl font-bold text-ink">Request Access to De-Identified Data</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Your Name
          <input required name="name" placeholder="e.g. Dr. Alice Uwimana" className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Email
          <input required type="email" name="email" placeholder="you@institution.edu" className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Requesting Institution
          <input name="institution" placeholder="e.g. University of Rwanda" className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Dataset Requested
          <input required name="title" placeholder="e.g. De-identified adherence trends, Kigali Sector, 2024" className="rounded border border-border px-3 py-2 text-base font-normal text-ink" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
          Research Purpose
          <textarea required name="purpose" rows={4} placeholder="Describe your research objective..." className="rounded border border-border p-3 text-base font-normal text-ink" />
        </label>
        {error && <p className="text-sm text-danger-text">{error}</p>}
        <button type="submit" disabled={submitting} className="mt-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Request'}</button>
      </form>
    </div>
  );
}
