import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get('next') ?? '/dashboard';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  useEffect(() => {
    if (loading) return;

    const finish = (hasSession: boolean) => {
      if (hasSession) {
        navigate(safeNext, { replace: true });
      } else {
        setError('Google sign-in could not be completed. Try again or use email.');
      }
    };

    if (session) {
      finish(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s }, error: err }) => {
      if (err) {
        setError(err.message);
        return;
      }
      finish(!!s);
    });
  }, [loading, session, navigate, safeNext]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: '#F5F0E6' }}
    >
      <div className="text-center max-w-sm">
        {error ? (
          <>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#E8651C' }}
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <div
              className="w-10 h-10 rounded-xl mx-auto mb-4 animate-pulse"
              style={{ backgroundColor: '#1B3B2F' }}
            />
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Completing Google sign-in…
            </p>
          </>
        )}
      </div>
    </div>
  );
}
