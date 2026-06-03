import React from 'react';
import { Student, Lesson, Payment, Instructor } from '../types';

interface DashboardProps {
  instructor: Instructor;
  students: Student[];
  lessons: Lesson[];
  payments: Payment[];
  onNavigate: (module: any) => void;
}

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</p>
        <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard({ instructor, students, lessons, payments, onNavigate }: DashboardProps) {
  const now = new Date();
  const activeStudents = students.filter(s => s.status === 'Active');
  
  // Upcoming lessons (next 7 days)
  const upcomingLessons = lessons
    .filter(l => {
      const start = new Date(l.start_time);
      return start >= now && l.status === 'Booked';
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  // Today's lessons
  const todayLessons = lessons.filter(l => {
    const d = new Date(l.start_time);
    return d.toDateString() === now.toDateString();
  });

  // Monthly earnings
  const completedLessons = lessons.filter(l => l.status === 'Completed');
  const monthlyEarnings = completedLessons.filter(l => {
    const d = new Date(l.start_time);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length * instructor.hourly_rate;

  // Students with due payments
  const studentsWithDue = students.filter(s => {
    const due = payments.filter(p => p.student_id === s.id && p.status === 'Due');
    return due.length > 0 && s.status === 'Active';
  });

  // Payment balance per student
  const getStudentBalance = (studentId: string) => {
    const studentLessons = lessons.filter(l => l.student_id === studentId && l.status === 'Completed');
    const paid = payments.filter(p => p.student_id === studentId && p.status === 'Paid').reduce((a, p) => a + p.amount, 0);
    const owed = studentLessons.length * instructor.hourly_rate;
    return paid - owed;
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name ?? 'Unknown';

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, {instructor.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#1B3B2F15', color: '#1B3B2F' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Dashboard
          </span>
        </div>
      </div>

      {/* Payment Due Alert */}
      {studentsWithDue.length > 0 && (
        <div className="rounded-2xl p-4 flex items-start gap-3 border"
          style={{ backgroundColor: '#FFF3ED', borderColor: '#E8651C40' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: '#E8651C' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: '#C4530F', fontFamily: 'Manrope, sans-serif' }}>
              Payment Due — {studentsWithDue.length} student{studentsWithDue.length > 1 ? 's' : ''} owe money
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#C4530F' }}>
              {studentsWithDue.map(s => s.name).join(', ')} — review in Payments tab.
            </p>
          </div>
          <button onClick={() => onNavigate('payments')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: '#E8651C', color: 'white' }}>
            Review
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Active Students"
          value={activeStudents.length}
          sub={`${students.filter(s => s.status === 'Passed').length} passed this year`}
          color="bg-emerald-50"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#1B3B2F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Today's Lessons"
          value={todayLessons.length}
          sub={todayLessons.length > 0 ? `First at ${formatTime(todayLessons[0].start_time)}` : 'No lessons today'}
          color="bg-blue-50"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
        />
        <StatCard
          label="Monthly Earnings"
          value={`£${monthlyEarnings}`}
          sub={`@ £${instructor.hourly_rate}/hr rate`}
          color="bg-orange-50"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#E8651C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          label="Lessons Completed"
          value={completedLessons.length}
          sub="All time"
          color="bg-purple-50"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Upcoming Lessons */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Upcoming Lessons</h2>
            <button onClick={() => onNavigate('diary')}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#E8651C', backgroundColor: '#E8651C10' }}>
              Open Diary →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingLessons.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-gray-400 text-sm">No upcoming lessons booked</p>
              </div>
            ) : (
              upcomingLessons.map(lesson => (
                <div key={lesson.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#1B3B2F12' }}>
                    <span className="text-xs font-bold" style={{ color: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}>
                      {new Date(lesson.start_time).getDate()}
                    </span>
                    <span className="text-xs" style={{ color: '#1B3B2F80' }}>
                      {new Date(lesson.start_time).toLocaleString('en-GB', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {getStudentName(lesson.student_id)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(lesson.start_time)} · {formatTime(lesson.start_time)} – {formatTime(lesson.end_time)}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#1B3B2F15', color: '#1B3B2F' }}>
                    Booked
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Balances */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Student Balances</h2>
            <button onClick={() => onNavigate('payments')}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#E8651C', backgroundColor: '#E8651C10' }}>
              Full Report →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {activeStudents.slice(0, 5).map(student => {
              const balance = getStudentBalance(student.id);
              const isNegative = balance < 0;
              return (
                <div key={student.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}>
                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>{student.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, balance >= 0 ? 100 : 20))}%`,
                            backgroundColor: isNegative ? '#E8651C' : '#1B3B2F',
                          }} />
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${isNegative ? 'text-red-500' : 'text-green-600'}`}
                    style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {isNegative ? `-£${Math.abs(balance)}` : `+£${balance}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Book a Lesson', icon: '📅', module: 'diary' as const, desc: 'Open the diary' },
          { label: 'Add Student', icon: '👤', module: 'students' as const, desc: 'Register new learner' },
          { label: 'Log Payment', icon: '💷', module: 'payments' as const, desc: 'Record a payment' },
        ].map(action => (
          <button key={action.label} onClick={() => onNavigate(action.module)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
            <span className="text-2xl">{action.icon}</span>
            <p className="font-bold text-gray-900 text-sm mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{action.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
