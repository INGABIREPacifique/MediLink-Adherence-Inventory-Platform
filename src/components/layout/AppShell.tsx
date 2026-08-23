import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { GreetingBanner } from '../ui/GreetingBanner';
import { useAuth } from '../../lib/AuthContext';

// Per-route subtext so the banner reflects what's actually on screen
// instead of showing the same line everywhere.
const routeSubtext: Record<string, string> = {
  '/': 'Review today\u2019s missed-dose escalations from discharged patients.',
  '/enrollment': 'Enroll a newly discharged patient into the adherence program.',
  '/inventory': 'Check ward stock levels against reorder thresholds.',
  '/handover': 'Review pending follow-ups before your shift ends.',
  '/discharge-summary': 'Reviewing a patient\u2019s completed monitoring period.',
  '/forecasting': 'AI forecasting activates once enough consumption data exists.',
  '/reports': 'Today\u2019s post-discharge adherence and stock summary.',
  '/settings': 'Escalation timing rules apply to all enrolled patients.',
  '/ussd-simulator': 'Simulating the patient-facing USSD confirmation flow.',
  '/chw/patients': 'Patients enrolled in the post-discharge adherence program.',
  '/chw/visit-log': 'Record and review home visits.',
  '/patients': 'Browse all enrolled patients and their adherence history.',
  '/help': 'What each part of the system does.',
};

const roleLabels: Record<string, string> = {
  nurse: 'WARD NURSE · KIGALI CENTRAL HOSPITAL',
  chw: 'COMMUNITY HEALTH WORKER',
  admin: 'ADMINISTRATOR',
};

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { profile } = useAuth();
  const isChwHome = location.pathname === '/' && profile?.role === 'chw';
  const subtext = isChwHome
    ? 'Your priority tasks and today\u2019s visit summary.'
    : routeSubtext[location.pathname] ?? 'Welcome back to MediLink Rwanda.';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-auto bg-bg p-10">
          <div className="mb-8">
            <GreetingBanner
              roleLabel={profile ? roleLabels[profile.role] : 'WARD NURSE · KIGALI CENTRAL HOSPITAL'}
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
