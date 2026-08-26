import { CheckCircle2, Calendar, Pill } from 'lucide-react';

// FRONTEND ONLY -- mock data, no Supabase call yet (see
// PatientPortalLayout.tsx for the backend-phase note).
export default function PatientDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Good morning, Jean-Baptiste!</h1>
        <p className="text-body">Here's how your treatment is going.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-success/30 bg-success-bg/40 p-5">
          <div className="flex items-center gap-2 text-success-text">
            <CheckCircle2 size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Adherence Rate</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-success-text">92%</p>
          <p className="text-xs text-success-text">Excellent consistency this month</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-navy">
            <Pill size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Today's Doses</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-ink">1 of 2</p>
          <p className="text-xs text-body">Confirmed via USSD this morning</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-navy">
            <Calendar size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Next Follow-up</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-ink">Nov 12</p>
          <p className="text-xs text-body">Kigali Central Hospital</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold text-ink">Your Current Medications</h2>
        <div className="flex flex-col divide-y divide-border">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Rifampicin/Isoniazid</p>
              <p className="text-xs text-body">150mg/75mg — Once daily, 8:00 AM</p>
            </div>
            <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">Taken today</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Pyridoxine</p>
              <p className="text-xs text-body">25mg — Once daily, 8:00 PM</p>
            </div>
            <span className="rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning-text">Due tonight</span>
          </div>
        </div>
      </div>
    </div>
  );
}
