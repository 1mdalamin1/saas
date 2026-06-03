import React, { useState } from 'react';
import { Student, StudentStatus } from '../types';

interface StudentsViewProps {
  students: Student[];
  onAdd: (s: Omit<Student, 'id' | 'instructor_id' | 'created_at'>) => void;
  onUpdate: (id: string, updates: Partial<Student>) => void;
  onDelete: (id: string) => void;
}

const STATUS_STYLE: Record<StudentStatus, { bg: string; text: string }> = {
  Active: { bg: '#D1FAE5', text: '#065F46' },
  Passed: { bg: '#DBEAFE', text: '#1D4ED8' },
  Cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function StudentsView({ students, onAdd, onUpdate, onDelete }: StudentsViewProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StudentStatus | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<Omit<Student, 'id' | 'instructor_id' | 'created_at'>>({
    name: '', phone: '', theory_passed: false, status: 'Active',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditStudent(null);
    setForm({ name: '', phone: '', theory_passed: false, status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({ name: s.name, phone: s.phone, theory_passed: s.theory_passed, status: s.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editStudent) {
      onUpdate(editStudent.id, form);
    } else {
      onAdd(form);
    }
    setShowModal(false);
  };

  const avatarInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const avatarColor = (name: string) => {
    const colors = ['#1B3B2F', '#E8651C', '#2563EB', '#7C3AED', '#DB2777', '#059669'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Students</h1>
          <p className="text-gray-500 text-sm mt-0.5">{students.filter(s => s.status === 'Active').length} active learners</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-all"
          style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search by name or phone…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#1B3B2F' } as React.CSSProperties} />
        </div>
        <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 gap-1">
          {(['All', 'Active', 'Passed', 'Cancelled'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === s ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              style={filterStatus === s ? { backgroundColor: '#1B3B2F' } : {}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-gray-400 font-medium">No students found</p>
            <p className="text-gray-300 text-sm mt-1">Try adjusting your search or add a new student</p>
          </div>
        ) : filtered.map(student => (
          <div key={student.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: avatarColor(student.name), fontFamily: 'Manrope, sans-serif' }}>
                  {avatarInitials(student.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>{student.name}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STATUS_STYLE[student.status].bg, color: STATUS_STYLE[student.status].text }}>
                      {student.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
                    </svg>
                    {student.phone}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full flex-1 justify-center ${student.theory_passed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                  {student.theory_passed ? (
                    <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg> Theory Passed</>
                  ) : (
                    <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> Theory Pending</>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                <button onClick={() => openEdit(student)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <a href={`https://wa.me/${student.phone.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-colors"
                  style={{ backgroundColor: '#25D36615', color: '#128C7E' }}
                  onClick={e => e.stopPropagation()}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </a>
                <button onClick={() => setShowDeleteConfirm(student.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ backgroundColor: '#1B3B2F' }}>
              <h3 className="font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {editStudent ? '✏️ Edit Student' : '👤 Add New Student'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Aisha Patel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#1B3B2F' } as React.CSSProperties} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">WhatsApp Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+447700900000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#1B3B2F' } as React.CSSProperties} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Status</label>
                <div className="flex gap-2">
                  {(['Active', 'Passed', 'Cancelled'] as StudentStatus[]).map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.status === s ? 'text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      style={form.status === s ? { backgroundColor: STATUS_STYLE[s].bg, color: STATUS_STYLE[s].text } : {}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.theory_passed ? 'border-transparent' : 'border-gray-300'}`}
                  style={form.theory_passed ? { backgroundColor: '#1B3B2F' } : {}}
                  onClick={() => setForm(f => ({ ...f, theory_passed: !f.theory_passed }))}>
                  {form.theory_passed && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 font-medium">Theory test passed</span>
              </label>
              <button onClick={handleSave}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 shadow-lg"
                style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}>
                {editStudent ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2} className="w-6 h-6">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Remove Student?</h3>
            <p className="text-gray-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => { onDelete(showDeleteConfirm); setShowDeleteConfirm(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
