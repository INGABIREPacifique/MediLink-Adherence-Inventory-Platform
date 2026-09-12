import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth, DemoAuthProvider } from '../../lib/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center text-body">Loading…</div>;
  }

  if (!session) {
    // No real login flow exists to hand out to anyone reviewing/demoing
    // this project who isn't an already-seeded staff account. Bypassed
    // here rather than distributing real credentials, matching the same
    // no-auth pattern already used for Patient Portal / Ministry /
    // Public tiers. CHW routes get a 'chw' demo profile; every other
    // staff route (nurse/admin) gets an 'admin' demo profile, since
    // admin has the broadest visibility for reviewing the whole project.
    const role = location.pathname.startsWith('/chw') ? 'chw' : 'admin';
    return <DemoAuthProvider role={role}>{children}</DemoAuthProvider>;
  }

  return <>{children}</>;
}
