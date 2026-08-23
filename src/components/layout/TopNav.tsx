import { Search, Bell, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

// Branding lives in the sidebar (Health Administration / Kigali Central
// Hospital) -- repeating a second, different brand name here ("HealthAdmin
// Rwanda") was both redundant and the source of a layout bug: the two-line
// 36px logo text was taller than the 64px header, causing it to overlap
// the search bar next to it. Removed; this bar is now just search + actions.
export function TopNav() {
  const { profile } = useAuth();
  const initial = profile?.full_name?.trim()?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-10 shadow-sm">
      <div className="relative w-full max-w-md">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" />
        <input
          type="text"
          placeholder="Search patients, ID, or medications..."
          className="w-full rounded-xl border border-border bg-bg py-2.5 pl-10 pr-4 text-sm text-body outline-none focus:ring-2 focus:ring-navy-light/40"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative flex items-center justify-center rounded-xl p-2 hover:bg-black/5"
        >
          <Bell size={20} className="text-body" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full border border-white bg-danger" />
        </button>
        <Link to="/help" aria-label="Help" className="flex items-center justify-center rounded-xl p-2 hover:bg-black/5">
          <HelpCircle size={20} className="text-body" />
        </Link>
        <div
          title={profile?.full_name}
          className="ml-4 flex size-8 items-center justify-center overflow-hidden rounded-xl border border-border bg-navy text-xs font-bold text-white"
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
