import type { ReactNode } from 'react';
import { useAuth } from '../../lib/AuthContext';
import Landing from '../../pages/Landing';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center text-body">Loading…</div>;
  }

  if (!session) {
    return <Landing />;
  }

  return <>{children}</>;
}
