import { useState } from 'react';
import { ShieldCheck, X, FileCheck } from 'lucide-react';

// Matches "National Performance Review Export" + "Digital Signature
// Modal". FRONTEND ONLY -- a real e-signature/legal sign-off workflow is
// a genuinely sensitive thing to wire for real (audit integrity, legal
// non-repudiation), not something to fake with a button that silently
// "signs" nothing real. Backend phase, flagged not decided silently.
const reportTypes = [
  { key: 'clinical', label: 'Adherence & Clinical Outcomes', desc: 'National adherence metrics and key clinical indicators.' },
  { key: 'supply', label: 'Supply Chain & Logistics', desc: 'Stockouts, delivery times, and resource utilization.' },
  { key: 'regional', label: 'Regional Performance Summary', desc: 'Comparative metrics across sectors and provinces.' },
  { key: 'financial', label: 'Financial & Resource Utilization', desc: 'Budget tracking, facility cost analysis.' },
];

export default function MinistryPerformanceExport() {
  const [selected, setSelected] = useState('clinical');
  const [signModalOpen, setSignModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">National Performance Review Export</h1>
      <p className="-mt-4 text-body">Generate and customize comprehensive health system reports for national oversight.</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-bold text-ink">Report Configuration</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {reportTypes.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setSelected(r.key)}
                  className={`rounded-lg border p-3 text-left ${selected === r.key ? 'border-navy bg-[#d7e2ff]/30' : 'border-border'}`}
                >
                  <p className="text-sm font-semibold text-ink">{r.label}</p>
                  <p className="text-xs text-body">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-bold text-ink">Advanced Customization</h3>
            <label className="mb-2 flex items-center gap-2 text-sm text-ink"><input type="checkbox" defaultChecked />Include AI Forecast Accuracy</label>
            <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" defaultChecked />CHW Workload Metrics</label>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-bold text-ink">Export Format</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 rounded border border-navy bg-[#d7e2ff]/30 p-2 text-sm"><input type="radio" name="fmt" defaultChecked />PDF Document</label>
            <label className="flex items-center gap-2 rounded border border-border p-2 text-sm"><input type="radio" name="fmt" />XLSX Spreadsheet</label>
          </div>
          <button onClick={() => setSignModalOpen(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white">
            <FileCheck size={15} />
            Generate &amp; Export Report
          </button>
        </div>
      </div>

      {signModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-ink">Sign &amp; Authenticate Report</h3>
              <button onClick={() => setSignModalOpen(false)}><X size={18} className="text-body" /></button>
            </div>
            <p className="mt-1 text-xs text-body">Ministry of Health -- Report Approval Workflow</p>
            <div className="mt-4 rounded bg-bg p-3 text-xs text-body">
              <p><span className="font-semibold text-ink">Document:</span> National Performance Review Export</p>
              <p><span className="font-semibold text-ink">Date:</span> {new Date().toLocaleDateString()}</p>
            </div>
            <label className="mt-4 flex items-center gap-2 text-xs text-body">
              <input type="checkbox" />
              I hereby certify that I have reviewed the contents of this report and authorize its publication as the system of record.
            </label>
            <div className="mt-4 flex items-center gap-2 text-xs text-success-text"><ShieldCheck size={13} />256-bit encrypted</div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSignModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-body">Cancel</button>
              <button disabled title="Real e-signature backend not built yet" className="cursor-not-allowed rounded-lg bg-navy/40 px-4 py-2 text-sm font-semibold text-white/70">Sign &amp; Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
