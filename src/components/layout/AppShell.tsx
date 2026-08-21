import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { GreetingBanner } from '../ui/GreetingBanner';
import { useAuth } from '../../lib/AuthContext';

// Per-route subtext — keeps the banner honest about what's actually on
// screen instead of always saying "3 escalations" even on the Ward
// Inventory page. Falls back to a generic line for any unmapped route.
const routeSubtext: Record<string, string> = {
  '/': '3 escalations need your attention today.',
  '/enrollment': "You're enrolling a new patient at discharge.",
  '/inventory': '2 items are below the reorder threshold.',
  '/handover': 'Review pending items before your shift ends.',
  '/discharge-summary': "Reviewing a patient's monitoring period outcome.",
  '/forecasting': 'AI forecasting activates once enough consumption data exists.',
  '/reports': "Here's today's ward-level adherence and stock summary.",
  '/settings': 'Escalation timing rules apply to all enrolled patients.',
};

const roleLabels: Record<string, string> = {
  nurse: 'WARD NURSE · INTERNAL MEDICINE',
  chw: 'COMMUNITY HEALTH WORKER',
  admin: 'ADMINISTRATOR',
};

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { profile } = useAuth();
  const subtext = routeSubtext[location.pathname] ?? 'Welcome back to MediLink Rwanda.';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-auto bg-bg p-10">
          <div className="mb-8">
            <GreetingBanner
              roleLabel={profile ? roleLabels[profile.role] : 'WARD NURSE · INTERNAL MEDICINE'}
              name={profile?.full_name?.split(' ')[0] ?? 'there'}
              subtext={subtext}
            />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
