import { useEffect, useState } from 'react';
import { Download, FileText, FileSpreadsheet, Send } from 'lucide-react';
import { getFacilities, type Facility } from '../../services/supabaseMinistryService';
import { getMinistryDashboardSummary, type MinistryDashboardSummary } from '../../services/supabaseMinistryService';

// Matches Figma "Sector Performance Reports" content. The Figma design's
// District Heatmap (an actual geo map) is replaced with a ranked list --
// same reasoning as other map-dependent screens: no facility/sector
// geolocation data exists in this pilot's schema.
//
// Real data as of migration 0019, but honestly scoped: the original mock
// showed a distinct adherence rate/trend/CHW-completion number PER
// sector. That can't be computed for real yet -- patients and inventory
// aren't linked to a facility_id, so there's no way to split adherence by
// sector. Rather than replace one set of fabricated numbers with
// another, this shows real facility counts per sector plus the one real
// number that does exist (pilot-wide adherence), labeled honestly as
// pilot-wide rather than implied as sector-specific.
export default function MinistrySectorReports() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [summary, setSummary] = useState<MinistryDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFacilities(), getMinistryDashboardSummary()]).then(([f, s]) => {
      setFacilities(f);
      setSummary(s);
      setLoading(false);
    });
  }, []);

  const sectorGroups = Object.entries(
    facilities.reduce<Record<string, Facility[]>>((acc, f) => {
      const key = f.sector ?? 'Unassigned';
      (acc[key] ??= []).push(f);
      return acc;
    }, {})
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Sector Performance Reports</h1>
          <p className="text-body">Facility distribution by sector.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
          <Download size={15} />
          Export Sector Data
        </button>
      </div>

      {!loading && summary && (
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-body">Pilot-Wide Adherence</p>
          <p className="text-2xl font-bold text-ink">{summary.adherenceRatePct}%</p>
          <p className="text-xs text-body">Sector-level breakdown needs patients linked to a facility, which this pilot's schema doesn't do yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && <p className="text-sm text-body">Loading…</p>}
        {!loading && sectorGroups.length === 0 && <p className="text-sm text-body">No facilities registered yet.</p>}
        {sectorGroups.map(([sector, facs]) => (
          <div key={sector} className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <p className="font-bold text-ink">{sector}</p>
            <p className="mt-2 text-xs font-semibold uppercase text-body">Facilities</p>
            <p className="text-2xl font-bold text-ink">{facs.length}</p>
            <ul className="mt-2 flex flex-col gap-1 text-xs text-body">
              {facs.map((f) => <li key={f.id}>{f.name}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="font-bold text-ink">Facilities per Sector</h3>
          <p className="mb-4 text-xs text-body">Real registration counts, not adherence-weighted</p>
          <div className="flex h-40 items-end gap-3">
            {sectorGroups.map(([sector, facs]) => (
              <div key={sector} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-navy" style={{ height: `${Math.min(100, facs.length * 25)}%` }} />
                <span className="text-[10px] text-body">{sector}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <h4 className="mb-2 text-sm font-bold text-ink">Export Sector Data</h4>
            <button className="mb-2 flex w-full items-center gap-2 rounded border border-border px-3 py-2 text-sm text-body"><FileText size={14} />Download PDF Report</button>
            <button className="flex w-full items-center gap-2 rounded border border-border px-3 py-2 text-sm text-body"><FileSpreadsheet size={14} />Export to CSV/Excel</button>
          </div>
          <div className="rounded-lg bg-navy p-4 text-white">
            <h4 className="mb-1 flex items-center gap-2 text-sm font-bold"><Send size={14} />Schedule Report</h4>
            <p className="mb-3 text-xs text-white/80">Recurring scheduled delivery isn't wired yet -- needs a background job, not just a button.</p>
            <button disabled title="Recurring send backend not built yet" className="w-full cursor-not-allowed rounded bg-white/40 py-1.5 text-xs font-semibold text-white/70">Configure Recurring Sync</button>
          </div>
        </div>
      </div>
    </div>
  );
}
