import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout, { AuthLink } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    setReady(true);
  }, [loading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePassword(password);
    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5F0E6' }}
      >
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthLayout
        title="Link expired or invalid"
        subtitle="Request a new password reset email to continue"
        footer={
          <>
            <AuthLink to="/forgot-password">Send reset link</AuthLink>
            {' · '}
            <AuthLink to="/login">Sign in</AuthLink>
          </>
        }
      >
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-4 text-sm text-amber-900">
          Open the reset link from your email, or request a new one if it has expired.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Enter and confirm your new password"
      footer={
        <>
          <AuthLink to="/login">Back to sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            New password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8651C]/40"
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Confirm password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8651C]/40"
            placeholder="Repeat password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  );
}
