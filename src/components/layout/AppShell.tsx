import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

// Matches the Figma spec exactly: sidebar + top nav, then a scrollable
// canvas (bg #f9f9ff, 40px padding) where each page owns its own header
// (title, description, summary cards) — no generic banner component here.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-auto bg-bg p-10">{children}</main>
      </div>
    </div>
  );
}
