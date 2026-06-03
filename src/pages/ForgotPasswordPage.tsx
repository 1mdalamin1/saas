import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout, { AuthLink } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword, session } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await resetPassword(email.trim());
    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="If an account exists for that address, we sent a reset link"
        footer={
          <>
            Remember your password? <AuthLink to="/login">Sign in</AuthLink>
          </>
        }
      >
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-800">
          We sent a password reset link to <strong>{email}</strong>. Open the link in your inbox
          to choose a new password. The link expires after a short time.
        </div>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}
        >
          Back to sign in
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email and we will send you a link to set a new password"
      footer={
        <>
          Remember your password? <AuthLink to="/login">Sign in</AuthLink>
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}
        >
          {submitting ? 'Sending link…' : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  );
}
