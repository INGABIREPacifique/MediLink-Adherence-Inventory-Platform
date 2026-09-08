import { useEffect, useState } from 'react';
import { FileText, Settings2, Send } from 'lucide-react';
import { getReportTemplates, createMinistryReport, type ReportTemplate } from '../../services/supabaseMinistryService';

// Matches "Refine Report Templates - Configuration Flow" from screenshot.
// Real data as of migration 0019 -- picks a real template and writes a
// real ministry_reports row on export (status starts pending_review,
// picked up by Report Approval).
export default function MinistryReportTemplates() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [period, setPeriod] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    getReportTemplates().then((t) => {
      setTemplates(t);
      setSelectedId(t[0]?.id ?? null);
      setLoading(false);
    });
  }, []);

  const selected = templates.find((t) => t.id === selectedId) ?? null;

  async function generate() {
    if (!selected) return;
    await createMinistryReport({ title: `${selected.name} — ${period}`, templateId: selected.id });
    setGenerated(true);
  }

  if (generated) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-border bg-white p-6 text-center shadow-xl">
        <p className="text-lg font-bold text-ink">Report Generated</p>
        <p className="mt-1 text-sm text-body">Sent to the Report Approval queue for review.</p>
        <button onClick={() => setGenerated(false)} className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">Generate Another</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-lg border border-border bg-white shadow-xl">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-bold text-ink">Refine Report Templates</h2>
        <p className="text-sm text-body">Configure this national data export template.</p>
      </div>
      <div className="flex flex-col gap-5 px-6 py-5">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"><FileText size={15} />Select Template</p>
          {loading && <p className="text-sm text-body">Loading…</p>}
          {!loading && templates.length === 0 && <p className="text-sm text-body">No templates yet. Create one first.</p>}
          <div className="flex flex-col gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`rounded-lg border-2 p-3 text-left ${t.id === selectedId ? 'border-navy bg-[#d7e2ff]/30' : 'border-border'}`}
              >
                <p className="text-sm font-semibold text-navy">{t.name}</p>
                <p className="text-xs text-body">{t.description ?? 'No description'}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"><Settings2 size={15} />Configuration Parameters</p>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-body">
              Reporting Period
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded border border-border px-3 py-2 text-sm text-ink">
                <option>Last 30 Days</option><option>Last Quarter</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-body">Cancel</button>
        <button onClick={generate} disabled={!selected} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send size={14} />Generate &amp; Export</button>
      </div>
    </div>
  );
}
