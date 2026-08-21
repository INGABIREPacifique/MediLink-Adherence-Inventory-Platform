import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setSubmitting(false);
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-1 text-2xl font-bold text-navy">MediLink Rwanda</h1>
        <p className="mb-6 text-sm text-body">Kigali Central Hospital · Internal Medicine</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-border px-3 py-2 text-base font-normal text-ink"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-body">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-border px-3 py-2 text-base font-normal text-ink"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-navy py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
