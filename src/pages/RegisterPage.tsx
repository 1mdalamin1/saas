import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout, { AuthLink } from '../components/AuthLayout';
import GoogleSignInButton, { AuthDivider } from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { signUp, session } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const { error: err } = await signUp(fullName.trim(), email.trim(), password);
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
        subtitle="We sent a confirmation link if email verification is enabled"
        footer={
          <>
            Already confirmed? <AuthLink to="/login">Sign in</AuthLink>
          </>
        }
      >
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-800">
          Account created for <strong>{email}</strong>. If your project requires email
          confirmation, open the link in your inbox, then sign in.
        </div>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}
        >
          Go to sign in
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Sign up with Google or create an account with email"
      footer={
        <>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <GoogleSignInButton label="Sign up with Google" />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Field label="Full name" id="fullName">
          <input
            id="fullName"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="James Whitfield"
          />
        </Field>

        <Field label="Email" id="email">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password" id="password">
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 6 characters"
          />
        </Field>

        <Field label="Confirm password" id="confirmPassword">
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="Repeat password"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}

const inputClass =
  'w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8651C]/40';

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
