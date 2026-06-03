import { useState } from 'react';
import { Student, Payment, Lesson, Instructor } from '../types';

interface PaymentsViewProps {
  students: Student[];
  payments: Payment[];
  lessons: Lesson[];
  instructor: Instructor;
  onAddPayment: (p: Omit<Payment, 'id' | 'created_at'>) => void;
  onMarkPaid: (id: string) => void;
}

export default function PaymentsView({ students, payments, lessons, instructor, onAddPayment, onMarkPaid }: PaymentsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', amount: '', status: 'Paid' as 'Paid' | 'Due' });
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

  const getStudentStats = (studentId: string) => {
    const completedLessons = lessons.filter(l => l.student_id === studentId && l.status === 'Completed').length;
    const totalOwed = completedLessons * instructor.hourly_rate;
    const totalPaid = payments.filter(p => p.student_id === studentId && p.status === 'Paid').reduce((a, p) => a + p.amount, 0);
    const balance = totalPaid - totalOwed;
    const hoursCredit = totalPaid / instructor.hourly_rate;
    const hoursUsed = completedLessons;
    return { totalOwed, totalPaid, balance, hoursCredit, hoursUsed, completedLessons };
  };

  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((a, p) => a + p.amount, 0);
  const totalOutstanding = students
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => {
      const stats = getStudentStats(s.id);
      return sum + Math.max(0, -stats.balance);
    }, 0);

  const handleAddPayment = () => {
    if (!form.student_id || !form.amount) return;
    onAddPayment({
      student_id: form.student_id,
      amount: parseFloat(form.amount),
      status: form.status,
    });
    setForm({ student_id: '', amount: '', status: 'Paid' });
    setShowModal(false);
  };

  const activeStudents = students.filter(s => s.status === 'Active');
  const displayStudents = selectedStudentId === 'all' ? activeStudents : activeStudents.filter(s => s.id === selectedStudentId);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const avatarInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Payment Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Automatic balance tracking @ £{instructor.hourly_rate}/hr</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-all"
          style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Log Payment
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>£{totalRevenue}</p>
          <p className="text-xs text-gray-400 mt-1">All time received</p>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Outstanding</p>
          <p className="text-2xl font-bold" style={{ color: totalOutstanding > 0 ? '#E8651C' : '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}>
            £{totalOutstanding}
          </p>
          <p className="text-xs text-gray-400 mt-1">Owed by students</p>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Hourly Rate</p>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>£{instructor.hourly_rate}</p>
          <p className="text-xs text-gray-400 mt-1">Per lesson hour</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setSelectedStudentId('all')}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selectedStudentId === 'all' ? 'text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          style={selectedStudentId === 'all' ? { backgroundColor: '#1B3B2F' } : {}}>
          All Students
        </button>
        {activeStudents.map(s => (
          <button key={s.id} onClick={() => setSelectedStudentId(s.id)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${selectedStudentId === s.id ? 'text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            style={selectedStudentId === s.id ? { backgroundColor: '#1B3B2F' } : {}}>
            {s.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Student payment cards */}
      <div className="space-y-4">
        {displayStudents.map(student => {
          const stats = getStudentStats(student.id);
          const isNegative = stats.balance < 0;
          const studentPayments = payments
            .filter(p => p.student_id === student.id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          return (
            <div key={student.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              {/* Student header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}>
                  {avatarInitials(student.name)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{student.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {stats.hoursUsed} lesson{stats.hoursUsed !== 1 ? 's' : ''} completed · Paid £{stats.totalPaid} · Owed £{stats.totalOwed}
                  </p>
                </div>

                {/* Balance badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isNegative ? '' : ''}`}
                  style={{
                    backgroundColor: isNegative ? '#FFF3ED' : '#D1FAE5',
                  }}>
                  {isNegative && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#E8651C" strokeWidth={2} className="w-4 h-4">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  )}
                  <span className="font-bold text-sm" style={{ color: isNegative ? '#E8651C' : '#065F46', fontFamily: 'Manrope, sans-serif' }}>
                    {isNegative ? `£${Math.abs(stats.balance)} owed` : `+£${stats.balance} credit`}
                  </span>
                </div>
              </div>

              {/* Hours progress bar */}
              <div className="px-5 py-3 border-b border-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span>Hours used: <strong className="text-gray-700">{stats.hoursUsed}h</strong></span>
                  <span>Paid for: <strong className="text-gray-700">{stats.hoursCredit.toFixed(1)}h</strong></span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (stats.hoursUsed / Math.max(stats.hoursCredit, 1)) * 100)}%`,
                      backgroundColor: isNegative ? '#E8651C' : '#1B3B2F',
                    }} />
                </div>
              </div>

              {/* Payment history */}
              {studentPayments.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {studentPayments.slice(0, 4).map(payment => (
                    <div key={payment.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${payment.status === 'Paid' ? 'bg-green-50' : 'bg-orange-50'}`}>
                        {payment.status === 'Paid' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2.5} className="w-4 h-4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} className="w-4 h-4">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">£{payment.amount}</p>
                        <p className="text-xs text-gray-400">{formatDate(payment.created_at)}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${payment.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                        {payment.status}
                      </span>
                      {payment.status === 'Due' && (
                        <button onClick={() => onMarkPaid(payment.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-all"
                          style={{ backgroundColor: '#1B3B2F' }}>
                          Mark Paid
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ backgroundColor: '#1B3B2F' }}>
              <h3 className="font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>💷 Log Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Student *</label>
                <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2">
                  <option value="">Select student…</option>
                  {activeStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Amount (£) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">£</span>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00" min="0" step="0.01"
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2" />
                </div>
                <div className="flex gap-2 mt-2">
                  {[42, 84, 126, 168].map(amt => (
                    <button key={amt} onClick={() => setForm(f => ({ ...f, amount: String(amt) }))}
                      className="flex-1 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 font-medium text-gray-500 transition-colors">
                      £{amt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Status</label>
                <div className="flex gap-2">
                  {(['Paid', 'Due'] as const).map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.status === s ? 'text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      style={form.status === s ? { backgroundColor: s === 'Paid' ? '#1B3B2F' : '#E8651C' } : {}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddPayment}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 shadow-lg"
                style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}>
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
