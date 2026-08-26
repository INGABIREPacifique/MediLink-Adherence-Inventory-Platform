import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Stethoscope, BarChart3, Bell, Settings } from 'lucide-react';

// Matches Figma's Ministry/Health Authority identity (seen across District
// Analytics, Clinical Follow-Up, Sector Reports, National Export screens):
// "Health Authority Analytics" branding, Dashboard/Inventory/Clinical/
// Reports top nav -- a third distinct shell, separate from staff/CHW and
// the Patient Portal.
//
// FRONTEND ONLY -- no real Ministry-level authentication exists. This
// tier would need its own auth/role (district/national health official,
// not nurse/chw/admin) -- backend phase, not built yet.
const navItems = [
  { to: '/ministry', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/ministry/inventory', label: 'Inventory', icon: Package },
  { to: '/ministry/clinical', label: 'Clinical', icon: Stethoscope },
  { to: '/ministry/reports', label: 'Reports', icon: BarChart3 },
  { to: '/ministry/national-export', label: 'National', icon: LayoutDashboard },
  { to: '/ministry/report-approval', label: 'Approvals', icon: Settings },
];

export function MinistryLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-6 border-b border-border bg-white px-6 shadow-sm">
          <h1 className="text-lg font-bold text-navy">Rwanda HealthSync</h1>
          <nav className="hidden gap-5 sm:flex">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `text-sm font-semibold ${isActive ? 'border-b-2 border-navy text-navy' : 'text-body'}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Bell size={18} className="text-body" />
            <Settings size={18} className="text-body" />
            <div className="flex size-8 items-center justify-center rounded-xl border border-border bg-navy text-xs font-bold text-white">HA</div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
