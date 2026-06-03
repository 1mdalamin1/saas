import React, { useState } from 'react';
import { Lesson, Student, LessonStatus } from '../types';

interface DiaryViewProps {
  lessons: Lesson[];
  students: Student[];
  onAddLesson: (lesson: Omit<Lesson, 'id'>) => void;
  onUpdateLesson: (id: string, updates: Partial<Lesson>) => void;
}

type ViewMode = 'week' | 'day';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7am to 6pm

function getWeekDays(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const STATUS_COLORS: Record<LessonStatus, { bg: string; text: string; border: string }> = {
  Booked: { bg: '#1B3B2F18', text: '#1B3B2F', border: '#1B3B2F' },
  Completed: { bg: '#D1FAE518', text: '#065F46', border: '#059669' },
  'No-show': { bg: '#FEE2E218', text: '#991B1B', border: '#DC2626' },
};

export default function DiaryView({ lessons, students, onAddLesson, onUpdateLesson }: DiaryViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [modalMode, setModalMode] = useState<'book' | 'view'>('book');
  const [_preselectedTime, setPreselectedTime] = useState<{ date: Date; hour: number } | null>(null);
  const [conflictError, setConflictError] = useState('');

  // Form state
  const [form, setForm] = useState({
    student_id: '',
    date: '',
    hour: 9,
    duration: 1,
    notes: '',
    status: 'Booked' as LessonStatus,
  });

  const weekDays = getWeekDays(currentDate);


  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  const getLessonAt = (date: Date, hour: number) =>
    lessons.find(l => {
      const s = new Date(l.start_time);
      return s.toDateString() === date.toDateString() && s.getHours() === hour;
    });

  const openBookModal = (date: Date, hour: number) => {
    const existing = getLessonAt(date, hour);
    if (existing) {
      setSelectedLesson(existing);
      setModalMode('view');
    } else {
      setPreselectedTime({ date, hour });
      const d = date.toISOString().split('T')[0];
      setForm({ student_id: '', date: d, hour, duration: 1, notes: '', status: 'Booked' });
      setModalMode('book');
      setConflictError('');
    }
    setShowModal(true);
  };

  const checkConflict = (date: string, hour: number, duration: number, excludeId?: string): boolean => {
    const startMs = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`).getTime();
    const endMs = startMs + duration * 3600000;
    return lessons.some(l => {
      if (l.id === excludeId) return false;
      const lStart = new Date(l.start_time).getTime();
      const lEnd = new Date(l.end_time).getTime();
      return startMs < lEnd && endMs > lStart;
    });
  };

  const handleBook = () => {
    if (!form.student_id || !form.date) return;
    if (checkConflict(form.date, form.hour, form.duration)) {
      setConflictError('⚠️ Conflict! Another lesson is already booked at this time.');
      return;
    }
    const start = new Date(`${form.date}T${form.hour.toString().padStart(2, '0')}:00:00`);
    const end = new Date(start.getTime() + form.duration * 3600000);
    onAddLesson({
      student_id: form.student_id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'Booked',
      notes: form.notes,
    });
    setShowModal(false);
    setConflictError('');
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name ?? 'Unknown';

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Smart Diary</h1>
          <p className="text-gray-500 text-sm mt-0.5">Click any time slot to book a lesson</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
            {(['week', 'day'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === v ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                style={viewMode === v ? { backgroundColor: '#1B3B2F' } : {}}>
                {v === 'week' ? 'Week' : 'Day'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button onClick={goToday}
            className="px-3 py-1 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            Today
          </button>
          <button onClick={() => navigate(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <h2 className="font-bold text-gray-900 ml-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {viewMode === 'week'
              ? `${weekDays[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${weekDays[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            }
          </h2>
          <div className="ml-auto flex items-center gap-4 text-xs text-gray-400">
            {(['Booked', 'Completed', 'No-show'] as LessonStatus[]).map(s => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s].border }} />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="overflow-x-auto">
            <div style={{ minWidth: '700px' }}>
              {/* Day headers */}
              <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                <div className="py-3" />
                {weekDays.map(day => (
                  <div key={day.toISOString()}
                    className={`py-3 text-center border-l border-gray-100 ${isToday(day) ? 'bg-orange-50/60' : ''}`}>
                    <p className="text-xs text-gray-400 font-medium">
                      {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </p>
                    <p className={`text-lg font-bold mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mx-auto ${isToday(day) ? 'text-white' : 'text-gray-800'}`}
                      style={isToday(day) ? { backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' } : { fontFamily: 'Manrope, sans-serif' }}>
                      {day.getDate()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Hour rows */}
              {HOURS.map(hour => (
                <div key={hour} className="grid border-b border-gray-50" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                  <div className="py-3 pr-3 text-right">
                    <span className="text-xs text-gray-300 font-medium">{formatHour(hour)}</span>
                  </div>
                  {weekDays.map(day => {
                    const lesson = getLessonAt(day, hour);
                    const colors = lesson ? STATUS_COLORS[lesson.status] : null;
                    return (
                      <div key={day.toISOString()}
                        className={`min-h-12 border-l border-gray-100 p-1 cursor-pointer transition-colors ${isToday(day) ? 'bg-orange-50/30' : 'hover:bg-gray-50/80'}`}
                        onClick={() => openBookModal(day, hour)}>
                        {lesson && (
                          <div className="h-full rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: colors!.bg,
                              color: colors!.text,
                              borderLeft: `3px solid ${colors!.border}`,
                            }}>
                            <p className="font-semibold truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
                              {getStudentName(lesson.student_id)}
                            </p>
                            <p className="opacity-70">{lesson.status}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="divide-y divide-gray-50">
            {HOURS.map(hour => {
              const lesson = getLessonAt(currentDate, hour);
              const colors = lesson ? STATUS_COLORS[lesson.status] : null;
              return (
                <div key={hour}
                  className="flex items-stretch min-h-14 cursor-pointer hover:bg-gray-50/60 transition-colors"
                  onClick={() => openBookModal(currentDate, hour)}>
                  <div className="w-20 flex-shrink-0 flex items-start justify-end pt-3 pr-4">
                    <span className="text-xs text-gray-300 font-medium">{formatHour(hour)}</span>
                  </div>
                  <div className="flex-1 py-2 pr-4">
                    {lesson && (
                      <div className="rounded-xl px-4 py-3 flex items-center gap-4"
                        style={{
                          backgroundColor: colors!.bg,
                          borderLeft: `4px solid ${colors!.border}`,
                        }}>
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color: colors!.text, fontFamily: 'Manrope, sans-serif' }}>
                            {getStudentName(lesson.student_id)}
                          </p>
                          <p className="text-xs mt-0.5 opacity-70" style={{ color: colors!.text }}>
                            {new Date(lesson.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} –{' '}
                            {new Date(lesson.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            {lesson.notes && ` · ${lesson.notes.slice(0, 60)}...`}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ backgroundColor: colors!.border + '25', color: colors!.text }}>
                          {lesson.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day's Lessons Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5">
        <h3 className="font-bold text-gray-900 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {viewMode === 'day' ? 'Today\'s' : 'This Week\'s'} Lesson Summary
        </h3>
        <div className="flex gap-4">
          {(['Booked', 'Completed', 'No-show'] as LessonStatus[]).map(status => {
            const relevantDays = viewMode === 'week' ? weekDays : [currentDate];
            const count = lessons.filter(l => {
              const d = new Date(l.start_time);
              return l.status === status && relevantDays.some(rd => rd.toDateString() === d.toDateString());
            }).length;
            return (
              <div key={status} className="flex-1 rounded-xl p-3 text-center"
                style={{ backgroundColor: STATUS_COLORS[status].bg }}>
                <p className="text-2xl font-bold" style={{ color: STATUS_COLORS[status].text, fontFamily: 'Manrope, sans-serif' }}>{count}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: STATUS_COLORS[status].text }}>{status}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ backgroundColor: '#1B3B2F' }}>
              <h3 className="font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {modalMode === 'book' ? '📅 Book New Lesson' : '📋 Lesson Details'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {modalMode === 'view' && selectedLesson ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}>
                    {getStudentName(selectedLesson.student_id).split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {getStudentName(selectedLesson.student_id)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(selectedLesson.start_time).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {' · '}
                      {new Date(selectedLesson.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(selectedLesson.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {selectedLesson.notes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 font-medium mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{selectedLesson.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">Update Status</p>
                  <div className="flex gap-2">
                    {(['Booked', 'Completed', 'No-show'] as LessonStatus[]).map(s => (
                      <button key={s}
                        onClick={() => {
                          onUpdateLesson(selectedLesson.id, { status: s });
                          setShowModal(false);
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${selectedLesson.status === s ? 'text-white' : 'text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                        style={selectedLesson.status === s ? { backgroundColor: STATUS_COLORS[s].border } : {}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {conflictError && (
                  <div className="text-sm font-medium text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                    {conflictError}
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Student *</label>
                  <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#1B3B2F' } as React.CSSProperties}>
                    <option value="">Select a student…</option>
                    {students.filter(s => s.status === 'Active').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Date *</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#1B3B2F' } as React.CSSProperties} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Start Time</label>
                    <select value={form.hour} onChange={e => setForm(f => ({ ...f, hour: +e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#1B3B2F' } as React.CSSProperties}>
                      {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Duration</label>
                  <div className="flex gap-2">
                    {[1, 1.5, 2].map(d => (
                      <button key={d} onClick={() => setForm(f => ({ ...f, duration: d }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.duration === d ? 'text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        style={form.duration === d ? { backgroundColor: '#1B3B2F' } : {}}>
                        {d}h
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Notes (Private)</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="Focus areas, reminders…"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ '--tw-ring-color': '#1B3B2F' } as React.CSSProperties} />
                </div>
                <button onClick={handleBook}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}>
                  Confirm Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
