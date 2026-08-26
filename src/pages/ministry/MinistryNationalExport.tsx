import { useState } from 'react';
import { AlertTriangle, X, ShieldCheck, Users, ClipboardCheck, Timer, Plus } from 'lucide-react';

// Matches Figma "National Health Authority Export Dashboard" content.
// FRONTEND ONLY -- mock data.
export default function MinistryNationalExport() {
  const [alertVisible, setAlertVisible] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-ink">National Overview</h1>

      {alertVisible && (
        <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-bg p-5">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-danger" />
          <div className="flex-1">
            <p className="font-bold text-danger-text">Supply Chain Alert: Northern Province</p>
            <p className="mt-1 text-sm text-danger-text">
              Antimalarial medication stocks in Musanze district have fallen below the 15-day minimum threshold due to recent distribution delays.
            </p>
            <button className="mt-3 rounded bg-danger px-3 py-1.5 text-xs font-semibold text-white">Review Logistics Routing</button>
          </div>
          <button onClick={() => setAlertVisible(false)} aria-label="Dismiss" className="text-danger-text">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-body">Overall Adherence</p><ShieldCheck size={16} className="text-success" /></div>
          <p className="mt-1 text-3xl font-bold text-navy">88.4%</p>
          <p className="text-xs text-success-text">↑ +2.1% vs last month</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-body">Active Patients</p><Users size={16} className="text-navy" /></div>
          <p className="mt-1 text-3xl font-bold text-ink">245.2k</p>
          <p className="text-xs text-success-text">↑ +4.5k new registrations</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-body">Stock Stability</p><ClipboardCheck size={16} className="text-danger" /></div>
          <p className="mt-1 text-3xl font-bold text-ink">94.1%</p>
          <p className="text-xs text-danger">↓ -1.2% due to Northern dist.</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-body">Avg CHW Response</p><Timer size={16} className="text-navy" /></div>
          <p className="mt-1 text-3xl font-bold text-ink">42m</p>
          <p className="text-xs text-success-text">↓ -5m improvement</p>
        </div>
      </div>

      <button className="flex w-fit items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
        <Plus size={15} />
        Generate Annual Review
      </button>
    </div>
  );
}
