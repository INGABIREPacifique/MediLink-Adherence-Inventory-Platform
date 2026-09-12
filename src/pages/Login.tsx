import { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, Radio, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

// Two-panel authentication screen: branding + access notices on the left,
// credentials form on the right. Structure follows a standard restricted-
// system login pattern -- adapted to MediLink's own navy branding rather
// than a generic security-vendor look.
//
// "Create Account" mode lets anyone self-register instead of needing
// credentials handed to them -- role is limited to Nurse/CHW here;
// Admin is deliberately not selectable (see migration 0029's trigger,
// which enforces this server-side too, not just in this form).
export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'nurse' | 'chw'>('nurse');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    if (mode === 'signIn') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error, needsEmailConfirmation } = await signUp(email, password, fullName, role);
      if (error) setError(error);
      else if (needsEmailConfirmation) setConfirmationSent(true);
    }
    setSubmitting(false);
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-bg px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-ink">Check your email</h2>
          <p className="mt-2 text-sm text-body">
            We sent a confirmation link to <span className="font-semibold text-ink">{email}</span>. Click it, then come back and sign in.
          </p>
          <button onClick={() => { setMode('signIn'); setConfirmationSent(false); }} className="mt-6 text-sm font-semibold text-navy-light">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg px-4 py-10">
      <div className="grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl border border-border bg-white shadow-xl md:grid-cols-2">
        {/* Left panel — branding + access notices */}
        <div className="flex flex-col gap-6 border-b border-border bg-row-alt p-8 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy text-white">
              <Radio size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-ink">
                MediLink <span className="text-navy">Rwanda</span>
              </h1>
              <p className="text-xs font-semibold uppercase tracking-wide text-body">
                Ward Care & Inventory System
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-bg/40 p-4">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-danger-text">Authorized Staff Only</p>
              <p className="mt-1 text-sm text-danger-text">
                This system is restricted to Kigali Central Hospital ward staff. Access is logged for patient data protection.
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-body">
            <span className="size-1.5 rounded-full bg-success" />
            Secure connection · Encrypted session
          </div>
        </div>

        {/* Right panel — credentials form */}
        <div className="flex flex-col justify-center p-8">
          <div className="mb-6 flex gap-1 rounded-lg bg-row-alt p-1">
            <button
              type="button"
              onClick={() => { setMode('signIn'); setError(null); }}
              className={`flex-1 rounded-md py-2 text-sm font-semibold ${mode === 'signIn' ? 'bg-white text-navy shadow-sm' : 'text-body'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signUp'); setError(null); }}
              className={`flex-1 rounded-md py-2 text-sm font-semibold ${mode === 'signUp' ? 'bg-white text-navy shadow-sm' : 'text-body'}`}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-2xl font-bold text-ink">{mode === 'signIn' ? 'Staff Sign In' : 'Create Your Account'}</h2>
          <p className="mb-6 text-sm text-body">
            {mode === 'signIn' ? 'Enter your credentials to access the ward dashboard.' : 'No credentials needed from anyone — set your own and get access right away.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signUp' && (
              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-body">
                Full Name
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jean-Baptiste Mukasa"
                  className="rounded border border-border bg-row-alt px-3 py-2.5 text-base font-normal normal-case text-ink outline-none focus:ring-2 focus:ring-navy-light/40"
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-body">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@medilink.rw"
                className="rounded border border-border bg-row-alt px-3 py-2.5 text-base font-normal normal-case text-ink outline-none focus:ring-2 focus:ring-navy-light/40"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-body">
              Password
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'signUp' ? 6 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-border bg-row-alt px-3 py-2.5 pr-10 text-base font-normal normal-case text-ink outline-none focus:ring-2 focus:ring-navy-light/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-body hover:text-ink"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {mode === 'signUp' && (
              <div className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-body">
                I am a…
                <div className="flex gap-2">
                  {(['nurse', 'chw'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold normal-case ${role === r ? 'border-navy bg-[#d7e2ff]/30 text-navy' : 'border-border text-body'}`}
                    >
                      {r === 'nurse' ? 'Nurse / Ward Staff' : 'Community Health Worker'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-sm hover:bg-navy-light disabled:opacity-50"
            >
              {mode === 'signIn' ? <LogIn size={16} /> : <UserPlus size={16} />}
              {submitting ? (mode === 'signIn' ? 'Signing in…' : 'Creating account…') : (mode === 'signIn' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
