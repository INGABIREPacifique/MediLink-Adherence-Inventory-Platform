import { useEffect, useState } from 'react';
import { Users, ClipboardList, Package } from 'lucide-react';
import { getFacilities, type Facility } from '../../services/supabaseMinistryService';

// Matches Figma "District Facility Management Dashboard" content. Real
// facility list as of migration 0019 (facilities table) -- patient
// counts per facility aren't shown since patients aren't yet linked to a
// facility_id in this pilot's schema, so that column would have to be
// fabricated; honestly omitted rather than faked.
export default function MinistryDistrictFacility() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacilities().then(setFacilities).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">District Facility Overview</h1>
        <p className="text-body">Facilities registered in the platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Users size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Registered Facilities</p></div>
          <p className="mt-1 text-3xl font-bold text-ink">{facilities.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><ClipboardList size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Districts Represented</p></div>
          <p className="mt-1 text-3xl font-bold text-ink">{new Set(facilities.map((f) => f.district).filter(Boolean)).size}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Package size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Facility Types</p></div>
          <p className="mt-1 text-3xl font-bold text-ink">{new Set(facilities.map((f) => f.facilityType).filter(Boolean)).size}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-bold text-ink">Facilities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Facility Name</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">District</th><th className="px-5 py-3">Sector</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-body">Loading…</td></tr>}
              {!loading && facilities.length === 0 && <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-body">No facilities registered yet.</td></tr>}
              {facilities.map((f, i) => (
                <tr key={f.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                  <td className="px-5 py-3 text-sm font-semibold text-ink">{f.name}</td>
                  <td className="px-5 py-3 text-sm text-body">{f.facilityType ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-body">{f.district ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-body">{f.sector ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
