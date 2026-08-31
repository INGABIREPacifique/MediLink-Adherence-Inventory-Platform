import { Link } from 'react-router-dom';
import { Radio, Stethoscope, ShieldCheck, User, ArrowRight, Globe } from 'lucide-react';

// Fixes a real gap: Patient Portal and Ministry tier existed only as
// hidden URLs (/patient, /ministry) nobody could discover -- no login
// screen, no link anywhere in the app pointed to them. This is the single
// entry point that makes every part of the system visible and clearly
// labeled, so it's obvious what's real (Staff & CHW, behind real Supabase
// auth) vs. preview (Patient Portal, Ministry tier -- frontend-only mock
// data, no real login exists yet for those user types).
export default function Landing() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-bg px-4 py-10">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-navy text-white">
          <Radio size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy">MediLink Rwanda</h1>
          <p className="text-xs text-body">Post-Discharge Medication Adherence Platform</p>
        </div>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/staff" className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-navy hover:shadow-md">
          <span className="flex size-10 items-center justify-center rounded-lg bg-navy text-white">
            <Stethoscope size={18} />
          </span>
          <div>
            <p className="font-bold text-ink">Staff &amp; CHW Portal</p>
            <p className="mt-1 text-sm text-body">Nurses, ward admins, and Community Health Workers. Real login, real patient data.</p>
          </div>
          <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-navy-light">
            Sign In <ArrowRight size={14} />
          </span>
        </Link>

        <Link to="/ministry" className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-navy hover:shadow-md">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#d7e2ff] text-navy">
            <ShieldCheck size={18} />
          </span>
          <div>
            <p className="font-bold text-ink">Ministry of Health Portal</p>
            <p className="mt-1 text-sm text-body">District and national health authority reporting.</p>
          </div>
          <span className="mt-auto flex items-center gap-2 text-sm font-semibold text-warning-text">
            <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs">Preview</span>
            No real login yet
          </span>
        </Link>

        <Link to="/patient" className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-navy hover:shadow-md">
          <span className="flex size-10 items-center justify-center rounded-lg bg-success-bg text-success-text">
            <User size={18} />
          </span>
          <div>
            <p className="font-bold text-ink">Patient Portal</p>
            <p className="mt-1 text-sm text-body">For patients who prefer a smartphone interface over USSD.</p>
          </div>
          <span className="mt-auto flex items-center gap-2 text-sm font-semibold text-warning-text">
            <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs">Preview</span>
            No real login yet
          </span>
        </Link>

        <Link to="/public" className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-navy hover:shadow-md">
          <span className="flex size-10 items-center justify-center rounded-lg bg-row-alt text-body">
            <Globe size={18} />
          </span>
          <div>
            <p className="font-bold text-ink">Public &amp; Research Portal</p>
            <p className="mt-1 text-sm text-body">Open health data and researcher dataset access requests.</p>
          </div>
          <span className="mt-auto flex items-center gap-2 text-sm font-semibold text-warning-text">
            <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs">Preview</span>
            No real login yet
          </span>
        </Link>
      </div>

      <p className="mt-8 max-w-md text-center text-xs text-body">
        Most patients confirm doses via USSD or a voice call — no app or login needed.
        The Patient Portal above is an optional preview for those who'd prefer a smartphone interface.
      </p>
    </div>
  );
}
