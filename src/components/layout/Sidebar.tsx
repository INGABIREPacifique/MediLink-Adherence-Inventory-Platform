import { NavLink } from 'react-router-dom';
import {
  Plus,
  Package,
  Radio,
  UserCheck,
  AlertTriangle,
  BarChart3,
  RefreshCcw,
  Settings,
  FileCheck,
  Smartphone,
  HelpCircle,
  LogOut,
  Cross,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

// Matches the "Health Administration / Kigali Central Hospital" sidebar
// identity used on the Ward Inventory (node 1:10655) and Staff Registration
// (node 1:12760) Figma screens -- chosen as the canonical identity since it
// names the actual pilot facility, over the alternate "Rwandan Health/Admin
// Portal" identity used only on the Escalation Inbox frame. The two Figma
// screens disagree with each other on branding/nav; this file resolves that
// by standardizing on one identity, then extends its 5-item nav (Stock
// Tracking / AI Forecasting / Patient Adherence / CHW Escalations / Facility
// Analytics) to cover all real pilot routes in the same visual style.
const navItems = [
  { to: '/inventory', label: 'Stock Tracking', icon: Package },
  { to: '/forecasting', label: 'AI Forecasting', icon: Radio },
  { to: '/enrollment', label: 'Patient Adherence', icon: UserCheck },
  { to: '/', label: 'CHW Escalations', icon: AlertTriangle, end: true },
  { to: '/reports', label: 'Facility Analytics', icon: BarChart3 },
  { to: '/handover', label: 'Shift Handover', icon: RefreshCcw },
  { to: '/discharge-summary', label: 'Discharge Summary', icon: FileCheck },
  { to: '/ussd-simulator', label: 'USSD Simulator', icon: Smartphone },
  { to: '/settings', label: 'System Settings', icon: Settings },
];

export function Sidebar() {
  const { signOut } = useAuth();
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col gap-4 border-r border-border bg-bg py-6 pl-4 pr-[17px]">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy text-white">
          <Cross size={16} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight text-navy">Health Administration</h1>
          <p className="text-xs text-body">Kigali Central Hospital</p>
        </div>
      </div>

      <NavLink
        to="/enrollment"
        className="flex items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-light"
      >
        <Plus size={16} />
        New Entry
      </NavLink>

      <nav className="mt-2 flex flex-col gap-1">
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
        <a href="#" className="flex items-center gap-3 rounded px-3 py-2 text-sm text-body hover:bg-black/5">
          <HelpCircle size={15} />
          Help Center
        </a>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 rounded px-3 py-2 text-sm text-body hover:bg-black/5"
        >
          <LogOut size={15} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
