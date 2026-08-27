import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import Login from './Login';

// Dedicated entry point for the "Staff & CHW Portal" choice on the landing
// page. If already logged in, there's nothing to do here -- send them
// straight into the real app at "/".
export default function StaffEntry() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center text-body">Loading…</div>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
}
