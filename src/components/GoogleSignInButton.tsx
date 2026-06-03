import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface GoogleSignInButtonProps {
  redirectPath?: string;
  label?: string;
}

export default function GoogleSignInButton({
  redirectPath = '/dashboard',
  label = 'Continue with Google',
}: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    const { error: err } = await signInWithGoogle(redirectPath);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold border border-black/10 bg-white text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-60"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        <GoogleIcon />
        {loading ? 'Redirecting…' : label}
      </button>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="relative flex items-center py-1">
      <div className="flex-grow border-t border-black/10" />
      <span
        className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-wide"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        or
      </span>
      <div className="flex-grow border-t border-black/10" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
