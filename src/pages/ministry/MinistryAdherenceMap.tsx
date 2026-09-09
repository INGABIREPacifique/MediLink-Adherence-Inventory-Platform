import { useEffect, useState } from 'react';
import { Users, Target, Sparkles } from 'lucide-react';
import { getClinicalFollowUpStats, type ClinicalFollowUpStats } from '../../services/supabaseMinistryService';
import { getFacilityAdherence, type FacilityAdherence } from '../../services/supabaseMinistryService';

// Matches "National Health Authority - Adherence Performance Map".
// Choropleth map replaced with a ranked district list -- same reasoning
// as every other map screen: no real geolocation data exists in this
// pilot's schema. Real per-district adherence as of migration 0024
// (patients.facility_id linkage) -- earlier versions of this screen
// could only show facility counts. The "AI Insights" panel from the
// original mock is still dropped rather than filled with invented text
// -- this project's real AI usage is scoped specifically to
// escalation-priority ranking, not district-level insight generation.
export default function MinistryAdherenceMap() {
  const [stats, setStats] = useState<ClinicalFollowUpStats | null>(null);
  const [facilityStats, setFacilityStats] = useState<FacilityAdherence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClinicalFollowUpStats(), getFacilityAdherence()]).then(([s, f]) => {
      setStats(s);
      setFacilityStats(f);
      setLoading(false);
    });
  }, []);

  const districtGroups = Object.entries(
    facilityStats.reduce<Record<string, FacilityAdherence[]>>((acc, f) => {
      const key = f.facility.district ?? 'Unassigned';
      (acc[key] ??= []).push(f);
      return acc;
    }, {})
  ).map(([district, facs]) => {
    const totalPatients = facs.reduce((sum, f) => sum + f.patientCount, 0);
    const weightedAdherence = totalPatients
      ? Math.round(facs.reduce((sum, f) => sum + f.adherenceRatePct * f.patientCount, 0) / totalPatients)
      : 0;
    return { district, totalPatients, weightedAdherence };
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Adherence Performance Overview</h1>
      <p className="-mt-4 text-body">Real adherence by district.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Target size={15} /><p className="text-xs font-semibold uppercase">Pilot-Wide Adherence</p></div>
          <p className="mt-1 text-3xl font-bold text-navy">{loading ? '—' : `${stats?.adherenceRatePct}%`}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Users size={15} /><p className="text-xs font-semibold uppercase">Total Enrolled Patients</p></div>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : stats?.activePatients}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Sparkles size={15} /><p className="text-xs font-semibold uppercase">Pending Escalations</p></div>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : stats?.pendingEscalations}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-bold text-ink">Adherence by District</h3>
        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-body">Loading…</p>}
          {!loading && districtGroups.length === 0 && <p className="text-sm text-body">No facilities registered yet.</p>}
          {districtGroups.map(({ district, totalPatients, weightedAdherence }) => (
            <div key={district}>
              <div className="flex justify-between text-sm font-semibold text-body"><span>{district}</span><span>{totalPatients > 0 ? `${weightedAdherence}%` : 'No patients'}</span></div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-row-alt">
                <div className={`h-full ${weightedAdherence >= 90 ? 'bg-success' : weightedAdherence >= 70 ? 'bg-warning-text' : 'bg-danger'}`} style={{ width: `${weightedAdherence}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
