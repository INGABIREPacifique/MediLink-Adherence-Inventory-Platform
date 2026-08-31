import { Link } from 'react-router-dom';
import { Database, ShieldCheck } from 'lucide-react';

// Matches "Dataset Catalog" (Research Data Portal). FRONTEND ONLY.
const datasets = [
  { title: 'National TB Adherence Longitudinal Study (2018-2023)', desc: 'De-identified dose confirmation records across 12 districts.', tags: ['Anonymized', 'Adherence'] },
  { title: 'Cold Chain Infrastructure Mapping & Downtime Log', desc: 'Facility-level cold storage reliability metrics.', tags: ['Infrastructure'] },
  { title: 'Maternal Mortality Review & Clinical Intervention Efficacy', desc: 'Aggregated maternal health outcome indicators.', tags: ['Restricted', 'Maternal Health'] },
];

export default function ResearchDataPortal() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dataset Catalog</h1>
        <p className="text-sm text-body">All datasets are anonymized in compliance with national data governance standards.</p>
      </div>

      <div className="rounded-lg border border-navy-light/30 bg-navy-light/5 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy"><ShieldCheck size={15} />Data Governance &amp; Approval Process</p>
        <p className="mt-1 text-xs text-body">All requests go through Ministry of Health review before access is granted. Turnaround is typically 10-15 business days.</p>
      </div>

      <div className="flex flex-col gap-3">
        {datasets.map((d) => (
          <div key={d.title} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy"><Database size={16} /></span>
              <div>
                <p className="font-semibold text-ink">{d.title}</p>
                <p className="text-sm text-body">{d.desc}</p>
                <div className="mt-1 flex gap-1.5">
                  {d.tags.map((t) => <span key={t} className="rounded bg-row-alt px-2 py-0.5 text-[10px] font-semibold text-body">{t}</span>)}
                </div>
              </div>
            </div>
            <Link to="/public/request-data" className="shrink-0 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white">Request Access</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
