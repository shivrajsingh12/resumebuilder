import { useState } from 'react';
import { Input, Textarea } from '../ui/Input';
import { generateId } from '../../utils/helpers';
import Button from '../ui/Button';

const blank = () => ({
  id: generateId(), school: '', degree: '', field: '', location: '',
  startDate: '', endDate: '', current: false, gpa: '', description: '',
});

export default function EducationEditor({ data, onChange }) {
  const [expanded, setExpanded] = useState(data[0]?.id ?? null);
  const add = () => { const n = blank(); onChange([...data, n]); setExpanded(n.id); };
  const update = (id, patch) => onChange(data.map(e => e.id === id ? { ...e, ...patch } : e));
  const remove = (id) => { onChange(data.filter(e => e.id !== id)); setExpanded(null); };

  return (
    <div className="space-y-3 animate-fade-in">
      {data.map(ed => (
        <div key={ed.id} className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]">
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--muted)] transition-colors" onClick={() => setExpanded(expanded === ed.id ? null : ed.id)}>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{ed.school || 'School name'}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</p>
            </div>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <button onClick={e => { e.stopPropagation(); remove(ed.id); }} className="w-6 h-6 flex items-center justify-center text-xs text-[var(--destructive)] rounded">✕</button>
              <span className="text-[var(--muted-foreground)] text-xs ml-1">{expanded === ed.id ? '▲' : '▼'}</span>
            </div>
          </div>
          {expanded === ed.id && (
            <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] pt-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="School / University" value={ed.school} onChange={e => update(ed.id, { school: e.target.value })} placeholder="UC Berkeley" />
                <Input label="Degree" value={ed.degree} onChange={e => update(ed.id, { degree: e.target.value })} placeholder="Bachelor of Science" />
                <Input label="Field of Study" value={ed.field} onChange={e => update(ed.id, { field: e.target.value })} placeholder="Computer Science" />
                <Input label="Location" value={ed.location} onChange={e => update(ed.id, { location: e.target.value })} placeholder="Berkeley, CA" />
                <Input label="Start Date" type="month" value={ed.startDate} onChange={e => update(ed.id, { startDate: e.target.value })} />
                <div className="space-y-1">
                  <Input label="End Date" type="month" value={ed.endDate} onChange={e => update(ed.id, { endDate: e.target.value })} disabled={ed.current} />
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={ed.current} onChange={e => update(ed.id, { current: e.target.checked })} />
                    <span className="text-[var(--muted-foreground)]">Currently enrolled</span>
                  </label>
                </div>
                <Input label="GPA (optional)" value={ed.gpa} onChange={e => update(ed.id, { gpa: e.target.value })} placeholder="3.87" />
              </div>
              <Textarea label="Description (optional)" rows={2} value={ed.description} onChange={e => update(ed.id, { description: e.target.value })} placeholder="Honors, activities, relevant coursework..." />
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">+ Add Education</Button>
    </div>
  );
}
