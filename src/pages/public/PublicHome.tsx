import { Link } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';

// Matches "National Health Data Transparency" (Public Health Portal
// Home). FRONTEND ONLY -- mock data.
export default function PublicHome() {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">National Health Data Transparency</h1>
        <p className="mt-1 max-w-2xl text-sm text-body">
          Aggregated, anonymized health system performance data, published openly by Rwanda's Ministry of Health.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><p className="text-2xl font-bold text-navy">94.2%</p><p className="text-xs text-body">National Adherence</p></div>
          <div><p className="text-2xl font-bold text-navy">1.2M</p><p className="text-xs text-body">Patients Reached</p></div>
          <div><p className="text-2xl font-bold text-navy">487</p><p className="text-xs text-body">Facilities Connected</p></div>
        </div>
        <div className="mt-4 flex gap-2">
          <Link to="/public/data-portal" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">Access Data Portal</Link>
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-body">Download Latest Report</button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">National Health Trends</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-body">Regional Improvement</p>
            <div className="h-32 rounded bg-row-alt" />
          </div>
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-body">Medication Accessibility Over Time</p>
            <div className="flex h-32 items-end gap-2">
              {[40, 55, 65, 80, 90].map((v, i) => (
                <div key={i} className="flex-1 rounded-t bg-success" style={{ height: `${v}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">Public Reports Library</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {['Q1 2024 National Adherence Report', '2023 Annual Clinical Data Review', 'Medicine Supply Chain Brief 1.1'].map((title) => (
            <div key={title} className="flex items-center justify-between rounded-lg border border-border bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2"><FileText size={15} className="text-navy" /><p className="text-xs font-semibold text-ink">{title}</p></div>
              <Download size={14} className="text-body" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
