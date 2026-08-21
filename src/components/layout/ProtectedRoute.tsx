import type { ReactNode } from 'react';
import { useAuth } from '../../lib/AuthContext';
import Login from '../../pages/Login';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center text-body">Loading…</div>;
  }

  if (!session) {
    return <Login />;
  }

  return <>{children}</>;
}
