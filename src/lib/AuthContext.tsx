import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

interface Profile {
  id: string | null;
  full_name: string;
  role: 'nurse' | 'chw' | 'admin';
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isChwDemo: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Lets ProtectedRoute mark a subtree as "CHW demo mode" -- reachable
// without a real Supabase session. Added because the CHW portal has no
// real login flow to hand out (there's no CHW-facing signup/credential
// distribution built), which made it unreachable by anyone who wasn't
// already a seeded staff account -- a real problem for demoing the
// project. This mirrors the no-auth pattern already used for the
// Patient Portal / Ministry / Public tiers, just scoped to CHW routes.
// Writes that would need a real profile id (see ChwTraining.tsx) treat
// a null id as "no real actor to attribute this to" rather than
// fabricating one -- same honesty rule as everywhere else in this
// project.
const ChwDemoContext = createContext(false);

export function ChwDemoProvider({ children }: { children: ReactNode }) {
  return <ChwDemoContext.Provider value={true}>{children}</ChwDemoContext.Provider>;
}

const DEMO_CHW_PROFILE: Profile = { id: null, full_name: 'Demo CHW (No Login)', role: 'chw' };
// Not a real Supabase Session -- just a truthy stand-in so ProtectedRoute's
// `if (!session)` check passes for the demo subtree. Never sent to
// Supabase; nothing reads fields off this beyond its truthiness.
const DEMO_SESSION = {} as Session;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data as Profile | null));
  }, [session]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut, isChwDemo: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  const isChwDemo = useContext(ChwDemoContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  // Only substitutes when there's genuinely no real session -- if staff
  // are actually logged in and happen to be on a /chw/* route, their
  // real session/profile wins, not the demo one.
  if (isChwDemo && !ctx.session) {
    return { ...ctx, session: DEMO_SESSION, profile: DEMO_CHW_PROFILE, loading: false, isChwDemo: true };
  }
  return ctx;
}
