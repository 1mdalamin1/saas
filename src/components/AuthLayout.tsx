import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer: ReactNode;
}

export default function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F0E6' }}>
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: '#1B3B2F' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#E8651C' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div>
            <p
              className="text-white text-xl font-bold"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Trava
            </p>
            <p className="text-white/50 text-sm">Driving Instructor Platform</p>
          </div>
        </div>
        <div>
          <h2
            className="text-3xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Manage your students, lessons & payments in one place.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Sign in to access your dashboard, smart diary, progress tracker, and more.
          </p>
        </div>
        <p className="text-white/30 text-xs">© Trava Driving Instructor</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#E8651C' }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2.5}
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span
              className="font-bold text-gray-900 text-lg"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Trava
            </span>
          </div>

          <h1
            className="text-2xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {title}
          </h1>
          <p className="text-gray-500 text-sm mb-8">{subtitle}</p>

          {children}

          <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-semibold hover:underline" style={{ color: '#E8651C' }}>
      {children}
    </Link>
  );
}
