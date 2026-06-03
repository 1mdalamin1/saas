import { FormEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout, { AuthLink } from '../components/AuthLayout';
import GoogleSignInButton, { AuthDivider } from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with Google or your email and password"
      footer={
        <>
          Don&apos;t have an account? <AuthLink to="/register">Create one</AuthLink>
        </>
      }
    >
      <GoogleSignInButton redirectPath={from} label="Sign in with Google" />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8651C]/40"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8651C]/40"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
