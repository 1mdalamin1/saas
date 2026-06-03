import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { session, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5F0E6' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl animate-pulse"
            style={{ backgroundColor: '#1B3B2F' }}
          />
          <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: '#F5F0E6' }}
      >
        <div className="max-w-md bg-white rounded-2xl p-8 shadow-sm border border-black/5 text-center">
          <h1
            className="text-xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Supabase not configured
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            Copy <code className="text-xs bg-gray-100 px-1 rounded">.env.example</code> to{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">.env.local</code> and add your
            project URL and anon key. Run <code className="text-xs bg-gray-100 px-1 rounded">supabase/schema.sql</code> in the SQL editor.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
