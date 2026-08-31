import { useState } from 'react';
import { Input } from '../ui/Input';
import { generateId } from '../../utils/helpers';
import Button from '../ui/Button';

export default function SkillsEditor({ data, onChange }) {
  const [expanded, setExpanded] = useState(data[0]?.id ?? null);
  const [newSkill, setNewSkill] = useState({});

  const add = () => {
    const n = { id: generateId(), category: '', skills: [] };
    onChange([...data, n]);
    setExpanded(n.id);
  };

  const update = (id, patch) => onChange(data.map(g => g.id === id ? { ...g, ...patch } : g));
  const remove = (id) => { onChange(data.filter(g => g.id !== id)); setExpanded(null); };

  const addSkill = (id) => {
    const val = (newSkill[id] || '').trim();
    if (!val) return;
    const group = data.find(g => g.id === id);
    if (!group) return;
    update(id, { skills: [...group.skills, val] });
    setNewSkill(prev => ({ ...prev, [id]: '' }));
  };

  const removeSkill = (groupId, skillIdx) => {
    const group = data.find(g => g.id === groupId);
    if (!group) return;
    update(groupId, { skills: group.skills.filter((_, i) => i !== skillIdx) });
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {data.map(g => (
        <div key={g.id} className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]">
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--muted)] transition-colors" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
            <div className="min-w-0">
              <p className="text-sm font-medium">{g.category || 'New Category'}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{g.skills.length} skill{g.skills.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button onClick={e => { e.stopPropagation(); remove(g.id); }} className="w-6 h-6 flex items-center justify-center text-xs text-[var(--destructive)] rounded">✕</button>
              <span className="text-xs text-[var(--muted-foreground)]">{expanded === g.id ? '▲' : '▼'}</span>
            </div>
          </div>
          {expanded === g.id && (
            <div className="px-4 pb-4 border-t border-[var(--border)] pt-3 space-y-3">
              <Input label="Category name" value={g.category} onChange={e => update(g.id, { category: e.target.value })} placeholder="Programming Languages" />
              <div>
                <p className="text-xs font-medium text-[var(--foreground)] opacity-80 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                  {g.skills.map((s, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] font-medium">
                      {s}
                      <button onClick={() => removeSkill(g.id, i)} className="ml-0.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)] leading-none text-sm">×</button>
                    </span>
                  ))}
                  {g.skills.length === 0 && <p className="text-xs text-[var(--muted-foreground)]">No skills yet</p>}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newSkill[g.id] || ''}
                    onChange={e => setNewSkill(prev => ({ ...prev, [g.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(g.id); } }}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                  <button onClick={() => addSkill(g.id)} className="px-3 py-1.5 text-xs bg-[var(--primary)] text-white rounded-lg hover:opacity-90">Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">+ Add Skill Category</Button>
    </div>
  );
}
