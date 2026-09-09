import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { getDischargeSummary, type DischargeSummaryData } from '../../services/supabaseDischargeService';

// Real data: the "report" shown here is the same real, computed discharge
// summary used elsewhere (adherence %, medications, monitoring period) --
// not a separate report-generation system, since none exists. Download
// is honestly disabled rather than faked: there's no PDF-generation
// backend for patient-facing reports yet (the real Monthly Report CSV
// export elsewhere in the project is staff-facing, not patient-facing).
const DEMO_PATIENT_ID = '44444444-4444-4444-4444-444444444444'; // Chantal Iribagiza, seeded with a full dose history

export default function PatientReports() {
  const [summary, setSummary] = useState<DischargeSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDischargeSummary(DEMO_PATIENT_ID).then(setSummary).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Your Reports</h1>
        <p className="text-body">Summaries of your treatment progress.</p>
      </div>

      <div className="flex flex-col gap-3">
        {loading && <p className="text-sm text-body">Loading…</p>}
        {!loading && summary && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy">
                <FileText size={16} />
              </span>
              <div>
                <p className="font-semibold text-ink">Adherence Summary</p>
                <p className="text-xs text-body">{summary.adherenceRatePct}% adherence · {new Date(summary.monitoringStart).toLocaleDateString()} – {new Date(summary.monitoringEnd).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              disabled
              title="PDF export for patient-facing reports isn't built yet -- this summary is real, but there's no report-generation backend to download it from"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-body opacity-50"
            >
              <Download size={14} />
              Download
            </button>
          </div>
        )}
        {!loading && !summary && <p className="text-sm text-body">No report data available yet.</p>}
      </div>
    </div>
  );
}
