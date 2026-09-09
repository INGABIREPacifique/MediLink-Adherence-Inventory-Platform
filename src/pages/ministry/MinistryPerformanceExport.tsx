import { useState } from 'react';
import { ShieldCheck, X, FileCheck } from 'lucide-react';
import { createMinistryReport, getMinistryReports, decideOnReport } from '../../services/supabaseMinistryService';

// Matches "National Performance Review Export" + "Digital Signature
// Modal". Generate & Export now writes a real ministry_reports row, and
// Sign & Approve writes a real report_approvals row (migrations
// 0018-0019) -- both were honestly disabled before since no backend
// existed. The signature itself is still a recorded note/audit trail,
// not cryptographic non-repudiation (a real PKI e-signature system is a
// bigger, still-deferred decision, same as flagged in the original
// handoff doc) -- so "256-bit encrypted" below is dropped as an
// unverifiable claim rather than kept as decoration.
const reportTypes = [
  { key: 'clinical', label: 'Adherence & Clinical Outcomes', desc: 'National adherence metrics and key clinical indicators.' },
  { key: 'supply', label: 'Supply Chain & Logistics', desc: 'Stockouts, delivery times, and resource utilization.' },
  { key: 'regional', label: 'Regional Performance Summary', desc: 'Comparative metrics across sectors and provinces.' },
  { key: 'financial', label: 'Financial & Resource Utilization', desc: 'Budget tracking, facility cost analysis.' },
];

export default function MinistryPerformanceExport() {
  const [selected, setSelected] = useState('clinical');
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [certifyChecked, setCertifyChecked] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function openSignModal() {
    setGenerating(true);
    const label = reportTypes.find((r) => r.key === selected)?.label ?? 'Performance Review';
    await createMinistryReport({ title: `${label} Export` });
    const reports = await getMinistryReports('pending_review');
    setReportId(reports[0]?.id ?? null);
    setGenerating(false);
    setSignModalOpen(true);
  }

  async function signAndApprove() {
    if (!reportId) return;
    await decideOnReport(reportId, 'approved', 'Signed via National Performance Review Export');
    setSigned(true);
    setSignModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">National Performance Review Export</h1>
      <p className="-mt-4 text-body">Generate and customize comprehensive health system reports for national oversight.</p>

      {signed && <p className="rounded-lg border border-success/30 bg-success-bg/40 px-4 py-2 text-sm font-semibold text-success-text">Report signed and approved — sent to Report Approval history.</p>}

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
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-bold text-ink">Export Format</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 rounded border border-navy bg-[#d7e2ff]/30 p-2 text-sm"><input type="radio" name="fmt" defaultChecked />PDF Document</label>
            <label className="flex items-center gap-2 rounded border border-border p-2 text-sm"><input type="radio" name="fmt" />XLSX Spreadsheet</label>
          </div>
          <button onClick={openSignModal} disabled={generating} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            <FileCheck size={15} />
            {generating ? 'Generating…' : 'Generate & Export Report'}
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
              <p><span className="font-semibold text-ink">Document:</span> {reportTypes.find((r) => r.key === selected)?.label} Export</p>
              <p><span className="font-semibold text-ink">Date:</span> {new Date().toLocaleDateString()}</p>
            </div>
            <label className="mt-4 flex items-center gap-2 text-xs text-body">
              <input type="checkbox" checked={certifyChecked} onChange={(e) => setCertifyChecked(e.target.checked)} />
              I hereby certify that I have reviewed the contents of this report and authorize its publication as the system of record.
            </label>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-body"><ShieldCheck size={12} /> Recorded as an audit-trail signature note, not a cryptographic e-signature.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSignModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-body">Cancel</button>
              <button onClick={signAndApprove} disabled={!certifyChecked} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Sign &amp; Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
