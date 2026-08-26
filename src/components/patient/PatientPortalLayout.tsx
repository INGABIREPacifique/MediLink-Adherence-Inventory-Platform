import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Pill, TrendingUp, FileText, Settings, HelpCircle, LogOut } from 'lucide-react';

// Matches Figma's "Patient Portal" identity (seen on the Discharge Summary
// and Patient Adherence History screens: nav = Dashboard/Medications/
// Adherence/Reports/Settings), separate branding from staff/CHW.
//
// FRONTEND ONLY per direction ("start from front end, backend after") --
// no real patient authentication exists yet. This shell is reachable
// directly (not behind ProtectedRoute, which gates staff Supabase auth) and
// all data on these pages is currently mock/placeholder, not from Supabase.
// Wiring a real patient login (almost certainly phone + OTP, not email/
// password like staff) and per-patient RLS is the backend phase for this
// batch -- flagged here so it isn't quietly forgotten.
const navItems = [
  { to: '/patient', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patient/medications', label: 'Medications', icon: Pill },
  { to: '/patient/adherence', label: 'Adherence', icon: TrendingUp },
  { to: '/patient/reports', label: 'Reports', icon: FileText },
  { to: '/patient/settings', label: 'Settings', icon: Settings },
];

export function PatientPortalLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <aside className="hidden w-60 shrink-0 flex-col gap-4 border-r border-border bg-white py-6 pl-4 pr-3 lg:flex">
        <div className="px-2 pb-6">
          <h1 className="text-lg font-bold text-navy">Patient Portal</h1>
          <p className="text-xs text-body">MediLink Rwanda</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2.5 text-sm ${
                  isActive ? 'bg-[rgba(128,249,139,0.35)] font-semibold text-navy' : 'text-body hover:bg-black/5'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <button className="flex items-center gap-3 rounded px-3 py-2 text-sm text-body hover:bg-black/5">
            <HelpCircle size={15} />
            Help
          </button>
          <button className="flex items-center gap-3 rounded px-3 py-2 text-sm text-body hover:bg-black/5">
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6 shadow-sm">
          <h2 className="text-base font-bold text-navy lg:hidden">Patient Portal</h2>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl border border-border bg-navy text-xs font-bold text-white">
              JM
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
