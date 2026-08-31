import { useState } from 'react';
import { Input, Textarea } from '../ui/Input';
import { generateId } from '../../utils/helpers';
import Button from '../ui/Button';

const blank = () => ({ id: generateId(), name: '', description: '', tech: [], url: '', github: '', startDate: '', endDate: '' });

export default function ProjectsEditor({ data, onChange }) {
  const [expanded, setExpanded] = useState(data[0]?.id ?? null);
  const [techInput, setTechInput] = useState({});

  const add = () => { const n = blank(); onChange([...data, n]); setExpanded(n.id); };
  const update = (id, patch) => onChange(data.map(p => p.id === id ? { ...p, ...patch } : p));
  const remove = (id) => { onChange(data.filter(p => p.id !== id)); setExpanded(null); };

  const addTech = (id) => {
    const val = (techInput[id] || '').trim();
    if (!val) return;
    const pr = data.find(p => p.id === id);
    if (!pr) return;
    update(id, { tech: [...pr.tech, val] });
    setTechInput(prev => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {data.map(pr => (
        <div key={pr.id} className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]">
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--muted)] transition-colors" onClick={() => setExpanded(expanded === pr.id ? null : pr.id)}>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{pr.name || 'New Project'}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{pr.tech.slice(0, 4).join(', ') || 'No tech stack yet'}</p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button onClick={e => { e.stopPropagation(); remove(pr.id); }} className="w-6 h-6 flex items-center justify-center text-xs text-[var(--destructive)] rounded">✕</button>
              <span className="text-xs text-[var(--muted-foreground)]">{expanded === pr.id ? '▲' : '▼'}</span>
            </div>
          </div>
          {expanded === pr.id && (
            <div className="px-4 pb-4 border-t border-[var(--border)] pt-3 space-y-3">
              <Input label="Project Name" value={pr.name} onChange={e => update(pr.id, { name: e.target.value })} placeholder="OpenCache" />
              <Textarea label="Description" rows={3} value={pr.description} onChange={e => update(pr.id, { description: e.target.value })} placeholder="What does this project do? What problem does it solve?" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Live URL" value={pr.url} onChange={e => update(pr.id, { url: e.target.value })} placeholder="opencache.dev" />
                <Input label="GitHub" value={pr.github} onChange={e => update(pr.id, { github: e.target.value })} placeholder="github.com/user/repo" />
                <Input label="Start Date" type="month" value={pr.startDate} onChange={e => update(pr.id, { startDate: e.target.value })} />
                <Input label="End Date" type="month" value={pr.endDate} onChange={e => update(pr.id, { endDate: e.target.value })} />
              </div>
              <div>
                <p className="text-xs font-medium mb-2 text-[var(--foreground)] opacity-80">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {pr.tech.map((t, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] font-mono">
                      {t}
                      <button onClick={() => update(pr.id, { tech: pr.tech.filter((_, j) => j !== i) })} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] leading-none">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={techInput[pr.id] || ''} onChange={e => setTechInput(prev => ({ ...prev, [pr.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(pr.id); } }} placeholder="React, TypeScript, etc." className="flex-1 px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                  <button onClick={() => addTech(pr.id)} className="px-3 py-1.5 text-xs bg-[var(--primary)] text-white rounded-lg hover:opacity-90">Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">+ Add Project</Button>
    </div>
  );
}
