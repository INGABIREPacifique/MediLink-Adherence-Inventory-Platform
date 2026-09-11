import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth, ChwDemoProvider } from '../../lib/AuthContext';
import Landing from '../../pages/Landing';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center text-body">Loading…</div>;
  }

  if (!session) {
    // CHW routes have no real login flow to hand out yet (no CHW-facing
    // signup/credential distribution exists), which made the whole
    // portal unreachable by anyone without a seeded staff account --
    // a real problem for demoing this project. Bypassed here rather
    // than building fake credentials, matching the same no-auth pattern
    // already used for Patient Portal / Ministry / Public tiers.
    if (location.pathname.startsWith('/chw')) {
      return <ChwDemoProvider>{children}</ChwDemoProvider>;
    }
    return <Landing />;
  }

  return <>{children}</>;
}
