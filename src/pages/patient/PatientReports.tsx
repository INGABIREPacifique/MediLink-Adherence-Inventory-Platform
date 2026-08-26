import { Download, FileText } from 'lucide-react';

// FRONTEND ONLY -- mock data.
const reports = [
  { title: 'October Adherence Summary', date: 'Nov 1, 2023', type: 'Monthly Summary' },
  { title: 'Treatment Completion Certificate', date: 'Pending', type: 'Discharge Report' },
];

export default function PatientReports() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Your Reports</h1>
        <p className="text-body">Download summaries of your treatment progress.</p>
      </div>

      <div className="flex flex-col gap-3">
        {reports.map((r) => (
          <div key={r.title} className="flex items-center justify-between rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy">
                <FileText size={16} />
              </span>
              <div>
                <p className="font-semibold text-ink">{r.title}</p>
                <p className="text-xs text-body">{r.type} · {r.date}</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-body">
              <Download size={14} />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
