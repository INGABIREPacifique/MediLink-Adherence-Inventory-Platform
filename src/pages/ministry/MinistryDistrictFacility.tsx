import { AlertTriangle, Users, ClipboardList, Package } from 'lucide-react';

// Matches Figma "District Facility Management Dashboard" content.
// FRONTEND ONLY -- mock data.
const facilities = [
  { name: 'Kigali University Teaching Hospital (CHUK)', type: 'Referral', patients: 45210, status: 'Nominal' },
  { name: 'Nyarugenge District Hospital', type: 'District', patients: 28940, status: 'Critical Res.' },
  { name: 'Muhima Maternity Hospital', type: 'Specialized', patients: 15600, status: 'Strained' },
  { name: 'Kibagabaga Hospital', type: 'District', patients: 31050, status: 'Nominal' },
  { name: 'Remera Health Center', type: 'Primary', patients: 9820, status: 'Nominal' },
];

const statusStyles: Record<string, string> = {
  Nominal: 'bg-success-bg text-success-text',
  'Critical Res.': 'bg-danger-bg text-danger-text',
  Strained: 'bg-warning-bg text-warning-text',
};

export default function MinistryDistrictFacility() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Kigali District Overview</h1>
        <p className="text-body">Aggregated performance and resource metrics across 12 active facilities.</p>
      </div>

      <div className="flex items-start justify-between gap-3 rounded-lg border border-danger/30 bg-danger-bg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="font-bold text-danger-text">Critical Supply Alert</p>
            <p className="text-sm text-danger-text">Nyarugenge Hospital reports &lt; 10% remaining stock of essential IV fluids.</p>
          </div>
        </div>
        <button className="shrink-0 rounded bg-danger px-3 py-1.5 text-xs font-semibold text-white">Dispatch Resources</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Users size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Total Enrolled Patients</p></div>
          <p className="mt-1 text-3xl font-bold text-ink">142,854</p>
          <p className="text-xs text-success-text">↑ +3.2% vs last month</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><ClipboardList size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Active Escalations</p></div>
          <p className="mt-1 text-3xl font-bold text-ink">24</p>
          <p className="text-xs text-body">Critical (5) · High (7) · Normal (12)</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-body"><Package size={15} /><p className="text-xs font-semibold uppercase tracking-wide">Inventory Health</p></div>
          <p className="mt-1 text-3xl font-bold text-success-text">86%</p>
          <p className="text-xs text-body">3 facilities below threshold</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-bold text-ink">Facility Performance Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-body">
              <tr><th className="px-5 py-3">Facility Name</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Patients</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr>
            </thead>
            <tbody>
              {facilities.map((f, i) => (
                <tr key={f.name} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-row-alt' : ''}`}>
                  <td className="px-5 py-3 text-sm font-semibold text-ink">{f.name}</td>
                  <td className="px-5 py-3 text-sm text-body">{f.type}</td>
                  <td className="px-5 py-3 text-sm text-body">{f.patients.toLocaleString()}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[f.status]}`}>{f.status}</span></td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-navy-light">Manage</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
