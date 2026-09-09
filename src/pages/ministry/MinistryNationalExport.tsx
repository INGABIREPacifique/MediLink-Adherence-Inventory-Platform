import { useEffect, useState } from 'react';
import { AlertTriangle, X, ShieldCheck, Users, ClipboardCheck, Plus } from 'lucide-react';
import { getClinicalFollowUpStats, type ClinicalFollowUpStats } from '../../services/supabaseMinistryService';
import { supabaseInventoryService } from '../../services/supabaseInventoryService';
import { createMinistryReport } from '../../services/supabaseMinistryService';

// Matches Figma "National Health Authority Export Dashboard" content.
// Real stats as of migrations 0018-0019. The alert banner and "Stock
// Stability" number now reflect actual critical inventory items instead
// of a hardcoded "Northern Province" scenario. "Avg CHW Response" is
// dropped -- nothing in this project computes response time yet, so it
// isn't shown rather than filled with an invented number.
export default function MinistryNationalExport() {
  const [alertVisible, setAlertVisible] = useState(true);
  const [stats, setStats] = useState<ClinicalFollowUpStats | null>(null);
  const [criticalCount, setCriticalCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    Promise.all([getClinicalFollowUpStats(), supabaseInventoryService.getItems()]).then(([s, items]) => {
      setStats(s);
      setCriticalCount(items.filter((i) => i.status === 'critical').length);
      setTotalItems(items.length);
      setLoading(false);
    });
  }, []);

  const stockStabilityPct = totalItems ? Math.round(((totalItems - criticalCount) / totalItems) * 100) : 100;

  async function generateReview() {
    await createMinistryReport({ title: 'Annual Pilot Review' });
    setGenerated(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">Pilot Overview</h1>

      {alertVisible && !loading && criticalCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-bg p-5">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-danger" />
          <div className="flex-1">
            <p className="font-bold text-danger-text">Supply Chain Alert</p>
            <p className="mt-1 text-sm text-danger-text">
              {criticalCount} inventory item{criticalCount === 1 ? ' is' : 's are'} at critical stock level. Review in Replenishment Approval.
            </p>
          </div>
          <button onClick={() => setAlertVisible(false)} aria-label="Dismiss" className="text-danger-text">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-body">Overall Adherence</p><ShieldCheck size={16} className="text-success" /></div>
          <p className="mt-1 text-3xl font-bold text-navy">{loading ? '—' : `${stats?.adherenceRatePct}%`}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-body">Active Patients</p><Users size={16} className="text-navy" /></div>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : stats?.activePatients}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-body">Stock Stability</p><ClipboardCheck size={16} className={criticalCount > 0 ? 'text-danger' : 'text-success'} /></div>
          <p className="mt-1 text-3xl font-bold text-ink">{loading ? '—' : `${stockStabilityPct}%`}</p>
          <p className="text-xs text-body">{loading ? '' : `${criticalCount} of ${totalItems} items critical`}</p>
        </div>
      </div>

      {generated ? (
        <p className="text-sm font-semibold text-success-text">Annual Review generated — sent to Report Approval.</p>
      ) : (
        <button onClick={generateReview} className="flex w-fit items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
          <Plus size={15} />
          Generate Annual Review
        </button>
      )}
    </div>
  );
}
