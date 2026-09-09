import { useEffect, useState } from 'react';
import { Download, FileText, FileSpreadsheet, Send } from 'lucide-react';
import { getFacilityAdherence, type FacilityAdherence } from '../../services/supabaseMinistryService';

// Matches Figma "Sector Performance Reports" content. The Figma design's
// District Heatmap (an actual geo map) is replaced with a ranked list --
// same reasoning as other map-dependent screens: no facility/sector
// geolocation data exists in this pilot's schema.
//
// Real per-facility adherence as of migration 0024 (patients.facility_id
// linkage) -- earlier versions of this screen could only show facility
// counts and honestly said per-sector adherence wasn't computable yet.
// That's no longer true: this now grouped-sums real adherence by sector.
export default function MinistrySectorReports() {
  const [facilityStats, setFacilityStats] = useState<FacilityAdherence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacilityAdherence().then(setFacilityStats).finally(() => setLoading(false));
  }, []);

  const sectorGroups = Object.entries(
    facilityStats.reduce<Record<string, FacilityAdherence[]>>((acc, f) => {
      const key = f.facility.sector ?? 'Unassigned';
      (acc[key] ??= []).push(f);
      return acc;
    }, {})
  ).map(([sector, facs]) => {
    const totalPatients = facs.reduce((sum, f) => sum + f.patientCount, 0);
    const weightedAdherence = totalPatients
      ? Math.round(facs.reduce((sum, f) => sum + f.adherenceRatePct * f.patientCount, 0) / totalPatients)
      : 0;
    return { sector, facs, totalPatients, weightedAdherence };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Sector Performance Reports</h1>
          <p className="text-body">Real adherence by sector, weighted by patient count.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
          <Download size={15} />
          Export Sector Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && <p className="text-sm text-body">Loading…</p>}
        {!loading && sectorGroups.length === 0 && <p className="text-sm text-body">No facilities registered yet.</p>}
        {sectorGroups.map(({ sector, facs, totalPatients, weightedAdherence }) => (
          <div key={sector} className={`rounded-lg border p-4 shadow-sm ${weightedAdherence < 70 && totalPatients > 0 ? 'border-danger' : 'border-border bg-white'}`}>
            <p className="font-bold text-ink">{sector}</p>
            <p className="mt-2 text-xs font-semibold uppercase text-body">Adherence Rate</p>
            <p className={`text-2xl font-bold ${weightedAdherence >= 90 ? 'text-success-text' : weightedAdherence >= 70 ? 'text-ink' : 'text-danger'}`}>{totalPatients > 0 ? `${weightedAdherence}%` : '—'}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-body">Patients</p><p className="font-semibold text-ink">{totalPatients}</p></div>
              <div><p className="text-body">Facilities</p><p className="font-semibold text-ink">{facs.length}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="font-bold text-ink">Adherence by Sector</h3>
          <p className="mb-4 text-xs text-body">Real, patient-weighted</p>
          <div className="flex h-40 items-end gap-3">
            {sectorGroups.map(({ sector, weightedAdherence }) => (
              <div key={sector} className="flex flex-1 flex-col items-center gap-1">
                <div className={`w-full rounded-t ${weightedAdherence >= 90 ? 'bg-success' : weightedAdherence >= 70 ? 'bg-warning-text' : 'bg-danger'}`} style={{ height: `${weightedAdherence}%` }} />
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
