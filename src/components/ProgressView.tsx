import { useState } from 'react';
import { Student, StudentProgress, ProgressSkill } from '../types';

interface ProgressViewProps {
  students: Student[];
  progress: StudentProgress[];
  onUpdateProgress: (studentId: string, skills: ProgressSkill[]) => void;
}

const RATING_COLORS = ['', '#DC2626', '#F97316', '#EAB308', '#22C55E', '#1B3B2F'];
const RATING_LABELS = ['', 'Needs Work', 'Developing', 'Progressing', 'Confident', 'Test Ready'];

export default function ProgressView({ students, progress, onUpdateProgress }: ProgressViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.filter(s => s.status === 'Active')[0]?.id ?? ''
  );
  const [editMode, setEditMode] = useState(false);
  const [localSkills, setLocalSkills] = useState<ProgressSkill[]>([]);

  const activeStudents = students.filter(s => s.status === 'Active');
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentProgress = progress.find(p => p.student_id === selectedStudentId);

  const skills = studentProgress?.skills ?? [];

  const startEdit = () => {
    setLocalSkills(skills.map(s => ({ ...s })));
    setEditMode(true);
  };

  const saveEdit = () => {
    onUpdateProgress(selectedStudentId, localSkills);
    setEditMode(false);
  };

  const setRating = (skillName: string, rating: number) => {
    setLocalSkills(prev => prev.map(s => s.name === skillName ? { ...s, rating } : s));
  };

  const overallScore = skills.length > 0
    ? Math.round((skills.reduce((a, s) => a + s.rating, 0) / (skills.length * 5)) * 100)
    : 0;

  const avatarInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const getReadinessLabel = (score: number) => {
    if (score >= 90) return { label: 'Test Ready 🏆', color: '#1B3B2F' };
    if (score >= 70) return { label: 'Nearly There 🎯', color: '#22C55E' };
    if (score >= 50) return { label: 'Good Progress 📈', color: '#EAB308' };
    if (score >= 25) return { label: 'Developing 🔧', color: '#F97316' };
    return { label: 'Early Stages 🌱', color: '#DC2626' };
  };

  const readiness = getReadinessLabel(overallScore);
  const currentSkills = editMode ? localSkills : skills;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Progress Tracker</h1>
          <p className="text-gray-500 text-sm mt-0.5">DVSA-standard skills assessment (1–5 rating)</p>
        </div>
        {!editMode ? (
          <button onClick={startEdit}
            disabled={!selectedStudentId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-40"
            style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Update Progress
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditMode(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={saveEdit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-all"
              style={{ backgroundColor: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Save
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Student Selector */}
        <div className="xl:col-span-1 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Select Student</h3>
          <div className="space-y-2">
            {activeStudents.map(student => {
              const sp = progress.find(p => p.student_id === student.id);
              const avg = sp ? Math.round((sp.skills.reduce((a, s) => a + s.rating, 0) / (sp.skills.length * 5)) * 100) : 0;
              const isSelected = selectedStudentId === student.id;
              return (
                <button key={student.id} onClick={() => { setSelectedStudentId(student.id); setEditMode(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${isSelected ? 'shadow-md' : 'bg-white border border-gray-100 hover:shadow-sm'}`}
                  style={isSelected ? { backgroundColor: '#1B3B2F' } : {}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: isSelected ? '#E8651C' : '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}>
                    {avatarInitials(student.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}
                      style={{ fontFamily: 'Manrope, sans-serif' }}>{student.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#E5E7EB' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${avg}%`, backgroundColor: isSelected ? '#E8651C' : '#1B3B2F' }} />
                      </div>
                      <span className={`text-xs font-medium flex-shrink-0 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>{avg}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills Panel */}
        <div className="xl:col-span-3">
          {selectedStudent ? (
            <div className="space-y-4">
              {/* Overview card */}
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1B3B2F" strokeWidth="3"
                        strokeDasharray={`${overallScore} ${100 - overallScore}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{overallScore}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{selectedStudent.name}</h2>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: readiness.color }}>{readiness.label}</p>
                    {studentProgress && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last updated: {new Date(studentProgress.last_updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {[1, 2, 3, 4, 5].map(r => {
                      const count = currentSkills.filter(s => s.rating === r).length;
                      return (
                        <div key={r} className="px-2 py-1 rounded-lg text-xs"
                          style={{ backgroundColor: RATING_COLORS[r] + '18', color: RATING_COLORS[r] }}>
                          <p className="font-bold">{count}</p>
                          <p className="opacity-70">Lvl {r}</p>
                        </div>
                      );
                    }).slice(0, 4)}
                  </div>
                </div>
              </div>

              {/* Skills list */}
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>DVSA Skills Assessment</h3>
                  {editMode && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full animate-pulse"
                      style={{ backgroundColor: '#E8651C20', color: '#E8651C' }}>
                      ● Editing
                    </span>
                  )}
                </div>
                <div className="divide-y divide-gray-50">
                  {currentSkills.map(skill => (
                    <div key={skill.name} className="px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Manrope, sans-serif' }}>{skill.name}</p>
                        <p className="text-xs mt-0.5 font-medium" style={{ color: RATING_COLORS[skill.rating] }}>
                          {RATING_LABELS[skill.rating]}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map(r => (
                          <button key={r}
                            disabled={!editMode}
                            onClick={() => editMode && setRating(skill.name, r)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${editMode ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} ${skill.rating >= r ? 'text-white shadow-sm' : 'text-gray-300'}`}
                            style={{
                              backgroundColor: skill.rating >= r ? RATING_COLORS[r] : '#F3F4F6',
                              transform: editMode && skill.rating === r ? 'scale(1.1)' : undefined,
                            }}>
                            {r}
                          </button>
                        ))}
                      </div>
                      <div className="w-24">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(skill.rating / 5) * 100}%`, backgroundColor: RATING_COLORS[skill.rating] }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating legend */}
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Rating Scale</p>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map(r => (
                    <div key={r} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: RATING_COLORS[r] + '18', color: RATING_COLORS[r] }}>
                      <span className="font-bold">{r}</span> — {RATING_LABELS[r]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-gray-400 font-medium">Select a student to view their progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
