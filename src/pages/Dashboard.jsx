import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { computeCompletion } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { getTemplate } from '../templates';

const TEMPLATE_COLORS = {
  modern: '#245b55', minimal: '#374151', twoColumn: '#52756b',
  creative: '#b34d67', sidebar: '#245b55', tech: '#183c3b',
  executive: '#1f2937', student: '#3d6b9e', ats: '#111827', timeline: '#8a5a32', compact: '#475569', academic: '#5d536b',
};

export default function Dashboard({ resumes, onCreate, onDuplicate, onDelete, onRename }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [newName, setNewName] = useState('');

  const filtered = resumes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    const id = onCreate(newName || undefined);
    setCreateModal(false);
    setNewName('');
    navigate(`/editor/${id}`);
  };

  const handleRename = () => {
    if (renameId && renameName.trim()) {
      onRename(renameId, renameName.trim());
    }
    setRenameId(null);
    setRenameName('');
  };

  const handleDelete = () => {
    if (deleteId) onDelete(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      

      <div className="page-shell py-8 sm:py-10">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-1">My Resumes</h1>
          <p className="text-[var(--muted-foreground)]">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} · Click to edit</p>
        </div> */}

        {/* Search */}
        <div className="mb-6 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resumes..."
            className="w-full max-w-md pl-10 pr-4 py-2.5 text-sm border border-[var(--border)] rounded-xl bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            <p className="text-5xl mb-4">📄</p>
            <p className="text-lg font-medium mb-2">{search ? 'No resumes match your search' : 'No resumes yet'}</p>
            <p className="text-sm mb-6">{search ? 'Try a different search term' : 'Create your first resume to get started'}</p>
            {!search && <Button onClick={() => setCreateModal(true)}>+ Create Your First Resume</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Create new card */}
            <button
              onClick={() => setCreateModal(true)}
              className="h-56 rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-3 hover:border-[var(--primary)] hover:bg-[var(--secondary)] transition-all group text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">+</span>
              <span className="text-sm font-medium">New Resume</span>
            </button>

            {filtered.map(r => {
              const completion = computeCompletion(r);
              const color = getTemplate(r.template).accentColor || TEMPLATE_COLORS[r.template] || '#4338ca';
              return (
                <div
                  key={r.id}
                  className="h-56 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:shadow-xl hover:border-[var(--primary)] transition-all cursor-pointer group relative"
                  onClick={() => navigate(`/editor/${r.id}`)}
                >
                  <div className="h-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-14 rounded bg-white shadow-md opacity-80 flex flex-col gap-1 p-1.5">
                        <div className="h-1.5 rounded" style={{ background: color, width: '60%' }} />
                        <div className="h-1 rounded bg-gray-200 w-full" />
                        <div className="h-1 rounded bg-gray-200 w-5/6" />
                        <div className="h-1 rounded bg-gray-200 w-4/6" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize text-white" style={{ background: color }}>{r.template}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-sm truncate text-[var(--foreground)] mb-0.5">{r.name}</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mb-3 truncate">{r.sections.personal.fullName || 'No name set'} · {r.sections.personal.title || 'No title'}</p>
                    <ProgressBar value={completion} size="sm" showPercent label="Completion" />
                  </div>

                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); setRenameId(r.id); setRenameName(r.name); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 text-gray-700 hover:bg-white shadow text-xs"
                      title="Rename"
                    >✎</button>
                    <button
                      onClick={e => { e.stopPropagation(); onDuplicate(r.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 text-gray-700 hover:bg-white shadow text-xs"
                      title="Duplicate"
                    >⎘</button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteId(r.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 text-red-600 hover:bg-red-50 shadow text-xs"
                      title="Delete"
                    >🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats row */}
        {resumes.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Total Resumes', value: resumes.length, icon: '📄' },
              { label: 'Avg Completion', value: `${Math.round(resumes.reduce((acc, r) => acc + computeCompletion(r), 0) / resumes.length)}%`, icon: '✅' },
              { label: 'Templates Used', value: new Set(resumes.map(r => r.template)).size, icon: '🎨' },
            ].map(s => (
              <div key={s.label} className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
                <p className="text-3xl mb-1">{s.icon}</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create New Resume" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--foreground)] opacity-80 block mb-1">Resume Name</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Software Engineer - Google"
              autoFocus
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Resume</Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal open={renameId !== null} onClose={() => setRenameId(null)} title="Rename Resume" size="sm">
        <div className="space-y-4">
          <input
            value={renameName}
            onChange={e => setRenameName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRename()}
            autoFocus
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRenameId(null)}>Cancel</Button>
            <Button onClick={handleRename}>Rename</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Resume" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">This action cannot be undone. Are you sure you want to delete this resume?</p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Resume</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
