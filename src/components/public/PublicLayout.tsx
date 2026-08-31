import { NavLink, Outlet } from 'react-router-dom';
import { Radio } from 'lucide-react';

// Matches Figma's public-site identity ("MediLink Rwanda" top nav:
// Home/Data Portal/Reports/About Us, Sign In button) -- a fourth distinct
// shell for the general public and researchers, separate from staff/CHW,
// Patient Portal, and Ministry tier. FRONTEND ONLY.
const navItems = [
  { to: '/public', label: 'Home', end: true },
  { to: '/public/data-portal', label: 'Data Portal' },
  { to: '/public/requests', label: 'My Requests' },
];

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex h-16 shrink-0 items-center gap-6 border-b border-border bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-navy text-white"><Radio size={16} /></span>
          <span className="text-lg font-bold text-navy">MediLink Rwanda</span>
        </div>
        <nav className="hidden gap-5 sm:flex">
          {navItems.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `text-sm font-semibold ${isActive ? 'text-navy' : 'text-body'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="ml-auto rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy">Sign In</button>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-white px-6 py-4 text-xs text-body">
        © {new Date().getFullYear()} MediLink Rwanda · Ministry of Health. All rights reserved.
      </footer>
    </div>
  );
}
