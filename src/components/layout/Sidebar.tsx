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
  Home,
  Users,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

// Same desktop shell (AppShell/Sidebar/TopNav) for every role -- not a
// separate mobile app. The nav content changes based on the logged-in
// user's role, per the person's explicit direction: "built it as desktop
// but for roles of CHW... this system might have different roles which
// will include different components or navbar."
const nurseAdminNav = [
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

// Matches Figma's CHW Field App content (node 1:2014 Home, 1:2293 Patient
// Registry, 1:1909 Visit Log) -- reskinned for this desktop shell instead
// of the mobile bottom-tab layout Figma shows, per the person's direction.
const chwNav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/chw/patients', label: 'My Patients', icon: Users },
  { to: '/chw/visit-log', label: 'Visit Log', icon: ClipboardList },
  { to: '/ussd-simulator', label: 'USSD Simulator', icon: Smartphone },
];

const brandByRole: Record<string, { title: string; subtitle: string }> = {
  nurse: { title: 'Health Administration', subtitle: 'Kigali Central Hospital' },
  admin: { title: 'Health Administration', subtitle: 'Kigali Central Hospital' },
  chw: { title: 'MediLink CHW', subtitle: 'Community Health Worker' },
};

export function Sidebar() {
  const { signOut, profile } = useAuth();
  const role = profile?.role ?? 'nurse';
  const isChw = role === 'chw';
  const navItems = isChw ? chwNav : nurseAdminNav;
  const brand = brandByRole[role] ?? brandByRole.nurse;

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col gap-4 border-r border-border bg-bg py-6 pl-4 pr-[17px]">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy text-white">
          <Cross size={16} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight text-navy">{brand.title}</h1>
          <p className="text-xs text-body">{brand.subtitle}</p>
        </div>
      </div>

      <NavLink
        to={isChw ? '/chw/visit-log' : '/enrollment'}
        className="flex items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-light"
      >
        <Plus size={16} />
        {isChw ? 'Log Visit' : 'New Entry'}
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
