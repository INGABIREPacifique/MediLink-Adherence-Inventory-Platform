import { FileText, Settings2, Send } from 'lucide-react';

// Matches "Refine Report Templates - Configuration Flow" from screenshot.
// FRONTEND ONLY -- mock data.
export default function MinistryReportTemplates() {
  return (
    <div className="mx-auto max-w-lg rounded-lg border border-border bg-white shadow-xl">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-bold text-ink">Refine Report Templates</h2>
        <p className="text-sm text-body">Configure this national data export template.</p>
      </div>
      <div className="flex flex-col gap-5 px-6 py-5">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"><FileText size={15} />Select Template</p>
          <div className="rounded-lg border-2 border-navy bg-[#d7e2ff]/30 p-3">
            <p className="text-sm font-semibold text-navy">National Health Board Summary</p>
            <p className="text-xs text-body">Adherence and clinical performance metrics.</p>
          </div>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"><Settings2 size={15} />Configuration Parameters</p>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-body">
              Reporting Period
              <select className="rounded border border-border px-3 py-2 text-sm text-ink"><option>Last 30 Days</option><option>Last Quarter</option></select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-body">
              Granularity Level
              <select className="rounded border border-border px-3 py-2 text-sm text-ink"><option>National</option><option>Provincial</option><option>District</option></select>
            </label>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-body">Cancel</button>
        <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"><Send size={14} />Generate &amp; Export</button>
      </div>
    </div>
  );
}
