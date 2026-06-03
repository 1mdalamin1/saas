import React from 'react';
import { ActiveModule, Instructor } from '../types';

interface SidebarProps {
  active: ActiveModule;
  instructor: Instructor;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const navItems: { id: ActiveModule; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'diary',
    label: 'Smart Diary',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    id: 'students',
    label: 'Students',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'Progress Tracker',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <path d="M1 10h22" />
      </svg>
    ),
  },
  {
    id: 'resources',
    label: 'Resource Library',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
];

export default function Sidebar({ active, instructor, onNavigate, onLogout }: SidebarProps) {
  const initials = instructor.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-30"
      style={{ backgroundColor: '#1B3B2F' }}
    >
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
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
            className="font-display font-800 text-white text-lg leading-tight"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}
          >
            Trava
          </p>
          <p className="text-xs text-white/50 leading-tight">Driving Instructor</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-xs uppercase tracking-widest text-white/30 px-3 mb-3 font-semibold">
          Main Menu
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(`/${item.id}`)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
              active === item.id
                ? 'text-white'
                : 'text-white/55 hover:text-white hover:bg-white/8'
            }`}
            style={active === item.id ? { backgroundColor: '#E8651C' } : {}}
          >
            <span
              className={`flex-shrink-0 transition-transform duration-200 ${active === item.id ? '' : 'group-hover:scale-110'}`}
            >
              {item.icon}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
            {active === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => onNavigate('/profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
            active === 'profile' ? 'bg-white/15' : 'bg-white/8 hover:bg-white/12'
          }`}
        >
          {instructor.avatar ? (
            <img
              src={instructor.avatar}
              alt=""
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 text-left">
            <p
              className="text-white text-sm font-semibold truncate"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {instructor.full_name}
            </p>
            <p className="text-white/40 text-xs truncate">{instructor.email}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/8 text-xs font-medium transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
