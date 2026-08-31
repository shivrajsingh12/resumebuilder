import { useState } from 'react';
import { Input, Textarea } from '../ui/Input';
import { generateId } from '../../utils/helpers';
import Button from '../ui/Button';

const blank = () => ({
  id: generateId(), company: '', position: '', location: '',
  startDate: '', endDate: '', current: false, description: '', bullets: [''],
});

export default function ExperienceEditor({ data, onChange }) {
  const [expanded, setExpanded] = useState(data[0]?.id ?? null);

  const add = () => {
    const n = blank();
    onChange([...data, n]);
    setExpanded(n.id);
  };

  const update = (id, patch) =>
    onChange(data.map(e => e.id === id ? { ...e, ...patch } : e));

  const remove = (id) => {
    onChange(data.filter(e => e.id !== id));
    setExpanded(null);
  };

  const moveUp = (i) => {
    if (i === 0) return;
    const arr = [...data];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    onChange(arr);
  };

  const moveDown = (i) => {
    if (i === data.length - 1) return;
    const arr = [...data];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    onChange(arr);
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {data.length === 0 && (
        <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
          <p className="text-3xl mb-2">💼</p>
          <p>No work experience added yet</p>
        </div>
      )}
      {data.map((exp, i) => (
        <div key={exp.id} className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--muted)] transition-colors"
            onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[var(--muted-foreground)] text-xs">⠿</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{exp.position || 'New Position'}</p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">{exp.company || 'Company name'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <button onClick={e => { e.stopPropagation(); moveUp(i); }} className="w-6 h-6 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded">↑</button>
              <button onClick={e => { e.stopPropagation(); moveDown(i); }} className="w-6 h-6 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded">↓</button>
              <button onClick={e => { e.stopPropagation(); remove(exp.id); }} className="w-6 h-6 flex items-center justify-center text-xs text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-900/20 rounded">✕</button>
              <span className="text-[var(--muted-foreground)] text-xs ml-1">{expanded === exp.id ? '▲' : '▼'}</span>
            </div>
          </div>

          {expanded === exp.id && (
            <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)]">
              <div className="grid grid-cols-2 gap-3 pt-3">
                <Input label="Job Title" value={exp.position} onChange={e => update(exp.id, { position: e.target.value })} placeholder="Senior Engineer" />
                <Input label="Company" value={exp.company} onChange={e => update(exp.id, { company: e.target.value })} placeholder="Stripe" />
                <Input label="Location" value={exp.location} onChange={e => update(exp.id, { location: e.target.value })} placeholder="San Francisco, CA" />
                <div />
                <Input label="Start Date" type="month" value={exp.startDate} onChange={e => update(exp.id, { startDate: e.target.value })} />
                <div className="space-y-1">
                  <Input label="End Date" type="month" value={exp.endDate} onChange={e => update(exp.id, { endDate: e.target.value })} disabled={exp.current} />
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={exp.current} onChange={e => update(exp.id, { current: e.target.checked, endDate: '' })} className="rounded" />
                    <span className="text-[var(--muted-foreground)]">Currently working here</span>
                  </label>
                </div>
              </div>
              <BulletsEditor
                bullets={exp.bullets}
                onChange={bullets => update(exp.id, { bullets })}
              />
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">+ Add Work Experience</Button>
    </div>
  );
}

function BulletsEditor({ bullets, onChange }) {
  const update = (i, val) => onChange(bullets.map((b, j) => j === i ? val : b));
  const remove = (i) => onChange(bullets.filter((_, j) => j !== i));
  const add = () => onChange([...bullets, '']);

  return (
    <div>
      <p className="text-xs font-medium text-[var(--foreground)] opacity-80 mb-2">Bullet Points</p>
      <div className="space-y-2">
        {bullets.map((b, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-[var(--primary)] mt-2 text-xs flex-shrink-0">▸</span>
            <Textarea
              rows={2}
              value={b}
              onChange={e => update(i, e.target.value)}
              placeholder="Describe an achievement with measurable impact..."
              className="flex-1 text-xs"
            />
            <button onClick={() => remove(i)} className="mt-1.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)] text-sm flex-shrink-0">✕</button>
          </div>
        ))}
        <button onClick={add} className="text-xs text-[var(--primary)] hover:underline">+ Add bullet</button>
      </div>
    </div>
  );
}
