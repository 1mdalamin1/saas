import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ActiveModule } from '../types';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const moduleTitle: Record<ActiveModule, string> = {
  dashboard: 'Dashboard',
  diary: 'Smart Diary',
  students: 'Students',
  progress: 'Progress Tracker',
  payments: 'Payments',
  resources: 'Resource Library',
  'import-export': 'Import/Export',
  profile: 'Profile',
};

function pathToModule(pathname: string): ActiveModule {
  const segment = pathname.replace(/^\//, '').split('/')[0] || 'dashboard';
  const valid: ActiveModule[] = [
    'dashboard',
    'diary',
    'students',
    'progress',
    'payments',
    'resources',
    'import-export',
    'profile',
  ];
  return valid.includes(segment as ActiveModule) ? (segment as ActiveModule) : 'dashboard';
}

export default function AppLayout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeModule = pathToModule(location.pathname);
  const title = moduleTitle[activeModule];

  const instructor = {
    id: user?.id ?? 'local',
    full_name: profile?.full_name ?? user?.email?.split('@')[0] ?? 'Instructor',
    email: user?.email ?? '',
    hourly_rate: profile?.hourly_rate ?? 42,
    avatar: profile?.avatar_url ?? undefined,
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E6' }}>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <Sidebar
          active={activeModule}
          instructor={instructor}
          onLogout={handleLogout}
          onNavigate={(path) => {
            navigate(path);
            setMobileOpen(false);
          }}
        />
      </div>

      <div className="lg:pl-64 min-h-screen">
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-black/8 sticky top-0 z-10"
          style={{ backgroundColor: '#F5F0E6' }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#1B3B2F' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#E8651C' }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span
              className="font-bold text-gray-900"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Trava
            </span>
          </div>
          <span className="text-gray-500 text-sm ml-1">/ {title}</span>
        </div>

        <main className="p-4 lg:p-8 max-w-screen-2xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
