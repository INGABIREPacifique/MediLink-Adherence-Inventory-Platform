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
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Lets ProtectedRoute mark a subtree as "demo mode" -- reachable without
// a real Supabase session. Originally CHW-only (no CHW-facing signup/
// credential flow was ever built), then extended to the whole staff
// portal for the same underlying reason: there's no way to hand real
// login credentials to someone reviewing/demoing this project who isn't
// an already-seeded staff account. This mirrors the no-auth pattern
// already used for the Patient Portal / Ministry / Public tiers.
//
// Writes that would need a real profile id (see ChwTraining.tsx) treat
// a null id as "no real actor to attribute this to" rather than
// fabricating one -- same honesty rule as everywhere else in this
// project. A genuinely logged-in staff session always takes priority
// over the demo one -- see useAuth() below.
type DemoRole = 'chw' | 'admin' | null;
const DemoRoleContext = createContext<DemoRole>(null);

export function DemoAuthProvider({ role, children }: { role: 'chw' | 'admin'; children: ReactNode }) {
  return <DemoRoleContext.Provider value={role}>{children}</DemoRoleContext.Provider>;
}

const DEMO_PROFILES: Record<'chw' | 'admin', Profile> = {
  chw: { id: null, full_name: 'Demo CHW (No Login)', role: 'chw' },
  admin: { id: null, full_name: 'Demo Staff (No Login)', role: 'admin' },
};
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
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut, isDemo: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  const demoRole = useContext(DemoRoleContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  // Only substitutes when there's genuinely no real session -- if staff
  // are actually logged in, their real session/profile always wins,
  // never the demo one.
  if (demoRole && !ctx.session) {
    return { ...ctx, session: DEMO_SESSION, profile: DEMO_PROFILES[demoRole], loading: false, isDemo: true };
  }
  return ctx;
}
