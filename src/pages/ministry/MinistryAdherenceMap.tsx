import { Users, Target, Sparkles } from 'lucide-react';

// Matches "National Health Authority - Adherence Performance Map".
// FRONTEND ONLY. Choropleth map replaced with a ranked district list --
// same reasoning as every other map screen in this build: no real
// geolocation data exists in this pilot's schema.
const districts = [
  { name: 'Nyarugenge', rate: 94.2 },
  { name: 'Kicukiro', rate: 91.5 },
  { name: 'Musanze', rate: 78.5 },
  { name: 'Gasabo', rate: 65.1 },
];

export default function MinistryAdherenceMap() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Adherence Performance Map</h1>
      <p className="-mt-4 text-body">National overview &amp; regional correlation analysis.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Target size={15} /><p className="text-xs font-semibold uppercase">National Adherence</p></div>
          <p className="mt-1 text-3xl font-bold text-navy">88.4%</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Users size={15} /><p className="text-xs font-semibold uppercase">Total Enrolled Cases</p></div>
          <p className="mt-1 text-3xl font-bold text-ink">42.5k</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Sparkles size={15} /><p className="text-xs font-semibold uppercase">Active Escalations</p></div>
          <p className="mt-1 text-3xl font-bold text-ink">154</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-ink">District Performance (30 Days)</h3>
          <div className="flex flex-col gap-3">
            {districts.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm font-semibold text-body"><span>{d.name}</span><span>{d.rate}%</span></div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-row-alt">
                  <div className={`h-full ${d.rate >= 90 ? 'bg-success' : d.rate >= 70 ? 'bg-warning-text' : 'bg-danger'}`} style={{ width: `${d.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-navy-light/30 bg-navy-light/5 p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy"><Sparkles size={15} />AI Insights</h3>
          <div className="flex flex-col gap-3 text-sm">
            <p><span className="font-semibold text-danger">Critical:</span> adherence in Gasabo District dropped 8% -- recommend increasing CHW density in Kigarama sector.</p>
            <p><span className="font-semibold text-success-text">Positive trend:</span> Nyarugenge sustained 90%+ adherence for the third consecutive month.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
