import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Radio,
  BarChart3,
  Settings,
  AlertTriangle,
  LifeBuoy,
  LogOut,
  UserPlus,
  RefreshCcw,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

const navItems = [
  { to: '/', label: 'Escalation Inbox', icon: LayoutDashboard },
  { to: '/enrollment', label: 'Patient Enrollment', icon: UserPlus },
  { to: '/inventory', label: 'Ward Inventory', icon: Package },
  { to: '/handover', label: 'Shift Handover', icon: RefreshCcw },
  { to: '/discharge-summary', label: 'Discharge Summary', icon: FileCheck },
  { to: '/forecasting', label: 'AI Forecasting', icon: Radio },
  { to: '/reports', label: 'Daily Report', icon: BarChart3 },
  { to: '/settings', label: 'Escalation Rules', icon: Settings },
];

// Matches Figma node 1:12504 ("Aside - JSON Component: SideNavBar") exactly:
// light #f9f9ff background with a right border, not a dark surface.
export function Sidebar() {
  const { signOut } = useAuth();
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col gap-4 border-r border-border bg-bg py-6 pl-4 pr-[17px]">
      <div className="flex items-center gap-3 px-2 pb-8">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e7e8ef] text-lg font-bold text-navy">
          RH
        </div>
        <div>
          <h1 className="text-[28px] font-semibold leading-[28px] tracking-[-0.28px] text-navy">
            Rwandan
            <br />
            Health
          </h1>
          <p className="text-sm text-body">Admin Portal</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded px-4 py-3 text-base ${
                isActive ? 'bg-[rgba(128,249,139,0.2)] font-bold text-navy' : 'text-body hover:bg-black/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-danger py-3 text-base text-white shadow-sm hover:bg-danger/90">
          <AlertTriangle size={20} />
          Emergency Alert
        </button>

        <div className="flex flex-col gap-1 border-t border-border pt-4">
          <a href="#" className="flex items-center gap-3 rounded px-4 py-2 text-sm text-body hover:bg-black/5">
            <LifeBuoy size={15} />
            Support
          </a>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 rounded px-4 py-2 text-sm text-body hover:bg-black/5"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
