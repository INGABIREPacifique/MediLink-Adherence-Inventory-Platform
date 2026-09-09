import { useEffect, useState } from 'react';
import { Users, Target, Sparkles } from 'lucide-react';
import { getClinicalFollowUpStats, type ClinicalFollowUpStats } from '../../services/supabaseMinistryService';
import { getFacilities, type Facility } from '../../services/supabaseMinistryService';

// Matches "National Health Authority - Adherence Performance Map".
// Choropleth map replaced with a ranked district list -- same reasoning
// as every other map screen: no real geolocation data exists in this
// pilot's schema. Real pilot-wide stats as of migrations 0018-0019;
// district breakdown shows real facility counts, not fabricated
// per-district adherence rates (same constraint as Sector Reports). The
// "AI Insights" panel is dropped rather than filled with different
// invented numbers -- this project's actual AI usage is scoped
// specifically to escalation-priority ranking (see the founding
// proposal), not national-level insight generation, which was never
// built and shouldn't be faked here.
export default function MinistryAdherenceMap() {
  const [stats, setStats] = useState<ClinicalFollowUpStats | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClinicalFollowUpStats(), getFacilities()]).then(([s, f]) => {
      setStats(s);
      setFacilities(f);
      setLoading(false);
    });
  }, []);

  const districtGroups = Object.entries(
    facilities.reduce<Record<string, number>>((acc, f) => {
      const key = f.district ?? 'Unassigned';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Adherence Performance Overview</h1>
      <p className="-mt-4 text-body">Pilot-wide adherence and facility distribution.</p>

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
        <h3 className="mb-4 font-bold text-ink">Facilities by District</h3>
        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-body">Loading…</p>}
          {!loading && districtGroups.length === 0 && <p className="text-sm text-body">No facilities registered yet.</p>}
          {districtGroups.map(([district, count]) => (
            <div key={district}>
              <div className="flex justify-between text-sm font-semibold text-body"><span>{district}</span><span>{count} facilit{count === 1 ? 'y' : 'ies'}</span></div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-row-alt">
                <div className="h-full bg-navy" style={{ width: `${Math.min(100, count * 25)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
