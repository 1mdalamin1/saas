import { useState } from 'react';
import { Resource, Student } from '../types';

interface ResourcesViewProps {
  resources: Resource[];
  students: Student[];
  onAdd: (r: Omit<Resource, 'id'>) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = ['All', 'Roundabouts', 'Manoeuvres', 'Safety', 'Road Types', 'Basics', 'Junctions'];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Roundabouts: { bg: '#DBEAFE', text: '#1D4ED8' },
  Manoeuvres: { bg: '#F3E8FF', text: '#7C3AED' },
  Safety: { bg: '#FEE2E2', text: '#991B1B' },
  'Road Types': { bg: '#D1FAE5', text: '#065F46' },
  Basics: { bg: '#FEF9C3', text: '#854D0E' },
  Junctions: { bg: '#FFE4E6', text: '#BE123C' },
};

function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url: string): string {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

export default function ResourcesView({ resources, students, onAdd, onDelete }: ResourcesViewProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [form, setForm] = useState({ title: '', youtube_url: '', category: 'Basics', description: '' });

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || r.category === filterCategory;
    return matchSearch && matchCat;
  });

  const handleAdd = () => {
    if (!form.title || !form.youtube_url) return;
    onAdd(form);
    setForm({ title: '', youtube_url: '', category: 'Basics', description: '' });
    setShowModal(false);
  };

  const openShare = (resource: Resource) => {
    setSelectedResource(resource);
    setShowShareModal(true);
  };

  const generateWhatsAppLink = (student: Student, resource: Resource) => {
    const message = encodeURIComponent(
      `Hi ${student.name.split(' ')[0]}! 👋\n\nHere's a great video to help you practice:\n\n📹 *${resource.title}*\n${resource.youtube_url}\n\nWatch it before our next lesson! 🚗\n\n- Your instructor`
    );
    return `https://wa.me/${student.phone.replace(/\s+/g, '')}?text=${message}`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Resource Library</h1>
          <p className="text-gray-500 text-sm mt-0.5">Save YouTube videos · Send to students via WhatsApp</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-all"
          style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Resource
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search resources…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 w-56" />
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterCategory === c ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              style={filterCategory === c ? { backgroundColor: '#1B3B2F' } : {}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-gray-400 font-medium">No resources found</p>
            <p className="text-gray-300 text-sm mt-1">Add YouTube videos to your library</p>
          </div>
        ) : filtered.map(resource => {
          const catStyle = CATEGORY_COLORS[resource.category] || { bg: '#F3F4F6', text: '#6B7280' };
          const thumbnail = getYouTubeThumbnail(resource.youtube_url);
          return (
            <div key={resource.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
              {/* Thumbnail */}
              <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                {thumbnail ? (
                  <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1B3B2F20' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1B3B2F" strokeWidth={1.5} className="w-10 h-10 opacity-40">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <a href={resource.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
                    onClick={e => e.stopPropagation()}>
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </a>
                </div>
                <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ backgroundColor: catStyle.bg, color: catStyle.text }}>
                  {resource.category}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <h3 className="font-bold text-gray-900 text-sm leading-snug" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {resource.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{resource.description}</p>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2">
                <button onClick={() => openShare(resource)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ backgroundColor: '#25D36615', color: '#128C7E' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  Send via WhatsApp
                </button>
                <button onClick={() => onDelete(resource.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ backgroundColor: '#1B3B2F' }}>
              <h3 className="font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>🎬 Add Resource</h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Mastering Roundabouts – Full Guide"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">YouTube URL *</label>
                <input type="url" value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Brief description of the video content…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none" />
              </div>
              <button onClick={handleAdd}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 shadow-lg"
                style={{ backgroundColor: '#E8651C', fontFamily: 'Manrope, sans-serif' }}>
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowShareModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ backgroundColor: '#1B3B2F' }}>
              <h3 className="font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                📱 Send via WhatsApp
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-white/60 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select a student to send <strong className="text-gray-900">"{selectedResource.title}"</strong>
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {students.filter(s => s.status === 'Active').map(student => (
                  <a key={student.id}
                    href={generateWhatsAppLink(student, selectedResource)}
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => setShowShareModal(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#1B3B2F', fontFamily: 'Manrope, sans-serif' }}>
                      {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Manrope, sans-serif' }}>{student.name}</p>
                      <p className="text-xs text-gray-400">{student.phone}</p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="#25D366" className="w-5 h-5 group-hover:scale-110 transition-transform">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
