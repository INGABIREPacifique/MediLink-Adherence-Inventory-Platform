import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Stethoscope, BarChart3, Bell, Settings, ShieldCheck, TrendingUp, FileCheck, Map, GitBranch } from 'lucide-react';

// Matches Figma's Ministry/Health Authority identity -- "Health Authority
// Analytics" branding, third distinct shell separate from staff/CHW and
// the Patient Portal. Restructured from a top nav bar (couldn't fit 13
// items) to a left sidebar with grouped sections, same pattern as the
// staff Sidebar.
//
// FRONTEND ONLY -- no real Ministry-level authentication exists yet.
const navGroups = [
  {
    section: 'Overview',
    items: [
      { to: '/ministry', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/ministry/national-export', label: 'National Overview', icon: TrendingUp },
      { to: '/ministry/district', label: 'District Performance', icon: Map },
    ],
  },
  {
    section: 'Clinical & Supply',
    items: [
      { to: '/ministry/clinical', label: 'Clinical Follow-Up', icon: Stethoscope },
      { to: '/ministry/inventory', label: 'Pharmacy Trends', icon: Package },
      { to: '/ministry/supply-chain', label: 'Supply Chain Correlation', icon: GitBranch },
      { to: '/ministry/adherence-map', label: 'Adherence Map', icon: Map },
    ],
  },
  {
    section: 'Reports',
    items: [
      { to: '/ministry/reports', label: 'Sector Reports', icon: BarChart3 },
      { to: '/ministry/sector-detail', label: 'Sector Detail', icon: BarChart3 },
      { to: '/ministry/report-templates', label: 'Report Templates', icon: FileCheck },
      { to: '/ministry/performance-export', label: 'Performance Export', icon: FileCheck },
      { to: '/ministry/report-approval', label: 'Approvals', icon: ShieldCheck },
    ],
  },
];

export function MinistryLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <aside className="hidden w-64 shrink-0 flex-col gap-4 border-r border-border bg-white py-6 pl-4 pr-3 lg:flex">
        <div className="px-2 pb-6">
          <h1 className="text-lg font-bold text-navy">Rwanda HealthSync</h1>
          <p className="text-xs text-body">Ministry of Health</p>
        </div>
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.section} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-body/70">{group.section}</p>
              {group.items.map(({ to, label, icon: Icon, end }) => (
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
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-border bg-white px-6 shadow-sm">
          <h2 className="mr-auto text-base font-bold text-navy lg:hidden">Rwanda HealthSync</h2>
          <Bell size={18} className="text-body" />
          <Settings size={18} className="text-body" />
          <div className="flex size-8 items-center justify-center rounded-xl border border-border bg-navy text-xs font-bold text-white">HA</div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
