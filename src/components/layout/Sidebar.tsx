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
  X,
  ShieldCheck,
  MessageSquareText,
  GraduationCap,
  Truck,
  Thermometer,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

// Same desktop shell (AppShell/Sidebar/TopNav) for every role -- not a
// separate mobile app. The nav content changes based on the logged-in
// user's role, per the person's explicit direction: "built it as desktop
// but for roles of CHW... this system might have different roles which
// will include different components or navbar."
// Grouped by actual usage pattern rather than the order items happened to
// get built in -- daily clinical work first, then periodic reporting,
// then occasional tools/admin. Was a flat 9-item list before, which mixed
// "used every day" (Escalations, Enrollment, Stock) with "used rarely"
// (System Settings, USSD Simulator) in no particular order.
const nurseAdminNavGroups: { section: string; items: { to: string; label: string; icon: typeof Package; end?: boolean }[] }[] = [
  {
    section: 'Daily Work',
    items: [
      { to: '/', label: 'CHW Escalations', icon: AlertTriangle, end: true },
      { to: '/enrollment', label: 'Patient Adherence', icon: UserCheck },
      { to: '/patients', label: 'Patient Directory', icon: Users },
      { to: '/inventory', label: 'Stock Tracking', icon: Package },
      { to: '/handover', label: 'Shift Handover', icon: RefreshCcw },
    ],
  },
  {
    section: 'Reports',
    items: [
      { to: '/reports', label: 'Facility Analytics', icon: BarChart3 },
      { to: '/supervisor', label: 'Supervisor Dashboard', icon: ShieldCheck },
      { to: '/replenishment', label: 'Replenishment Approval', icon: Package },
      { to: '/order-tracking', label: 'Order Tracking', icon: Truck },
      { to: '/cold-chain', label: 'Cold Chain Monitor', icon: Thermometer },
      { to: '/thermal-audit', label: 'Thermal Audit Log', icon: Thermometer },
      { to: '/forecasting', label: 'AI Forecasting', icon: Radio },
      { to: '/discharge-summary', label: 'Discharge Summary', icon: FileCheck },
    ],
  },
  {
    section: 'Tools & Admin',
    items: [
      { to: '/ussd-simulator', label: 'USSD Simulator', icon: Smartphone },
      { to: '/feedback', label: 'Pilot Feedback', icon: MessageSquareText },
      { to: '/settings', label: 'System Settings', icon: Settings },
    ],
  },
];

// Matches Figma's CHW Field App content (node 1:2014 Home, 1:2293 Patient
// Registry, 1:1909 Visit Log, 1:6740 Local Inventory, 1:12320 Training
// Portal) -- reskinned for this desktop shell instead of the mobile
// bottom-tab layout Figma shows, per the person's direction.
const chwNav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/chw/patients', label: 'My Patients', icon: Users },
  { to: '/chw/visit-log', label: 'Visit Log', icon: ClipboardList },
  { to: '/chw/inventory', label: 'Local Inventory', icon: Package },
  { to: '/ussd-simulator', label: 'USSD Simulator', icon: Smartphone },
  { to: '/chw/training', label: 'Training Portal', icon: GraduationCap },
];

const brandByRole: Record<string, { title: string; subtitle: string }> = {
  nurse: { title: 'Health Administration', subtitle: 'Kigali Central Hospital' },
  admin: { title: 'Health Administration', subtitle: 'Kigali Central Hospital' },
  chw: { title: 'MediLink CHW', subtitle: 'Community Health Worker' },
};

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// Was a permanently-visible fixed-width block with zero responsive
// behavior -- on an actual phone screen (which is realistically how a CHW
// uses this while out doing home visits between patients) a static 256px
// sidebar would eat most of the viewport and leave content unusable. Now:
// permanent visible sidebar at lg+ (desktop/tablet), slide-out drawer with
// backdrop below that (phone).
export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const role = profile?.role ?? 'nurse';
  const isChw = role === 'chw';
  const brand = brandByRole[role] ?? brandByRole.nurse;

  function renderLink({ to, label, icon: Icon, end }: { to: string; label: string; icon: typeof Package; end?: boolean }) {
    return (
      <NavLink
        key={to}
        to={to}
        end={end}
        onClick={onMobileClose}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded px-3 py-2.5 text-sm ${
            isActive ? 'bg-[rgba(128,249,139,0.35)] font-semibold text-navy' : 'text-body hover:bg-black/5'
          }`
        }
      >
        <Icon size={17} />
        {label}
      </NavLink>
    );
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onMobileClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col gap-4 border-r border-border bg-bg py-6 pl-4 pr-[17px] transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-2 pb-6">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy text-white">
            <Cross size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight text-navy">{brand.title}</h1>
            <p className="text-xs text-body">{brand.subtitle}</p>
          </div>
          <button onClick={onMobileClose} aria-label="Close menu" className="rounded p-1 text-body hover:bg-black/5 lg:hidden">
            <X size={18} />
          </button>
        </div>

      <NavLink
        to={isChw ? '/chw/visit-log' : '/enrollment'}
        onClick={onMobileClose}
        className="flex items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-light"
      >
        <Plus size={16} />
        {isChw ? 'Log Visit' : 'New Entry'}
      </NavLink>

      <nav className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto">
        {isChw
          ? chwNav.map(renderLink)
          : nurseAdminNavGroups.map((group) => (
              <div key={group.section} className="flex flex-col gap-1">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-body/70">{group.section}</p>
                {group.items.map(renderLink)}
              </div>
            ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        <NavLink to="/help" onClick={onMobileClose} className="flex items-center gap-3 rounded px-3 py-2 text-sm text-body hover:bg-black/5">
          <HelpCircle size={15} />
          Help Center
        </NavLink>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 rounded px-3 py-2 text-sm text-body hover:bg-black/5"
        >
          <LogOut size={15} />
          Log Out
        </button>
      </div>
      </aside>
    </>
  );
}
