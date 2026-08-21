import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { GreetingBanner } from '../ui/GreetingBanner';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-auto bg-bg p-10">
          <div className="mb-8">
            <GreetingBanner
              roleLabel="WARD NURSE · INTERNAL MEDICINE"
              name="Uwase"
              subtext="3 escalations need your attention today."
            />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
