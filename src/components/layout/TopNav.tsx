import { useState } from 'react';
import { Search, Bell, HelpCircle, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useNotifications } from '../../lib/NotificationContext';

interface TopNavProps {
  onMenuClick: () => void;
}

// Branding lives in the sidebar (Health Administration / Kigali Central
// Hospital) -- repeating a second, different brand name here ("HealthAdmin
// Rwanda") was both redundant and the source of a layout bug: the two-line
// 36px logo text was taller than the 64px header, causing it to overlap
// the search bar next to it. Removed; this bar is now just search + actions.
export function TopNav({ onMenuClick }: TopNavProps) {
  const { profile } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [panelOpen, setPanelOpen] = useState(false);
  const navigate = useNavigate();
  const initial = profile?.full_name?.trim()?.[0]?.toUpperCase() ?? '?';

  function handleBellClick() {
    setPanelOpen((v) => !v);
    if (!panelOpen) markAllRead();
  }

  function handleNotificationClick(id: string, linkTo: string) {
    markRead(id);
    setPanelOpen(false);
    navigate(linkTo);
  }

  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-white px-4 shadow-sm sm:px-6 lg:px-10">
      <button onClick={onMenuClick} aria-label="Open menu" className="rounded-xl p-2 text-body hover:bg-black/5 lg:hidden">
        <Menu size={22} />
      </button>

      <div className="relative w-full max-w-md">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" />
        <input
          type="text"
          placeholder="Search patients, ID, or medications..."
          className="w-full rounded-xl border border-border bg-bg py-2.5 pl-10 pr-4 text-sm text-body outline-none focus:ring-2 focus:ring-navy-light/40"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="relative">
          <button
            onClick={handleBellClick}
            aria-label="Notifications"
            className="relative flex items-center justify-center rounded-xl p-2 hover:bg-black/5"
          >
            <Bell size={20} className="text-body" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full border border-white bg-danger text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {panelOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setPanelOpen(false)} />
              <div className="absolute right-0 z-40 mt-2 w-80 rounded-lg border border-border bg-white shadow-xl">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-bold text-ink">Notifications</p>
                  <p className="text-xs text-body">Live updates when a new escalation is created</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-body">Nothing yet -- you'll see new escalations here as they happen.</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id, n.linkTo)}
                        className="flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-bg"
                      >
                        <p className="text-sm text-ink">{n.message}</p>
                        <p className="text-xs text-body">{new Date(n.createdAt).toLocaleTimeString()}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <Link to="/help" aria-label="Help" className="hidden items-center justify-center rounded-xl p-2 hover:bg-black/5 sm:flex">
          <HelpCircle size={20} className="text-body" />
        </Link>
        <div
          title={profile?.full_name}
          className="ml-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-navy text-xs font-bold text-white sm:ml-4"
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
