import { useState } from 'react';
import { Input, Textarea } from '../ui/Input';
import { generateId } from '../../utils/helpers';
import Button from '../ui/Button';

// --- Certifications ---
const blankCert = () => ({ id: generateId(), name: '', issuer: '', date: '', url: '', credentialId: '' });

export function CertificationsEditor({ data, onChange }) {
  const [expanded, setExpanded] = useState(null);
  const add = () => { const n = blankCert(); onChange([...data, n]); setExpanded(n.id); };
  const update = (id, patch) => onChange(data.map(c => c.id === id ? { ...c, ...patch } : c));
  const remove = (id) => onChange(data.filter(c => c.id !== id));

  return (
    <div className="space-y-3 animate-fade-in">
      {data.map(c => (
        <div key={c.id} className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]">
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--muted)]" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{c.name || 'New Certification'}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{c.issuer}</p>
            </div>
            <div className="flex gap-1 ml-2">
              <button onClick={e => { e.stopPropagation(); remove(c.id); }} className="w-6 h-6 flex items-center justify-center text-xs text-[var(--destructive)] rounded">✕</button>
              <span className="text-xs text-[var(--muted-foreground)]">{expanded === c.id ? '▲' : '▼'}</span>
            </div>
          </div>
          {expanded === c.id && (
            <div className="px-4 pb-4 border-t border-[var(--border)] pt-3 grid grid-cols-2 gap-3">
              <Input label="Certification Name" value={c.name} onChange={e => update(c.id, { name: e.target.value })} placeholder="AWS Solutions Architect" className="col-span-2" />
              <Input label="Issuing Organization" value={c.issuer} onChange={e => update(c.id, { issuer: e.target.value })} placeholder="Amazon Web Services" />
              <Input label="Date" type="month" value={c.date} onChange={e => update(c.id, { date: e.target.value })} />
              <Input label="Credential ID" value={c.credentialId} onChange={e => update(c.id, { credentialId: e.target.value })} placeholder="AWS-SAP-1234" />
              <Input label="Verify URL" value={c.url} onChange={e => update(c.id, { url: e.target.value })} placeholder="https://..." />
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">+ Add Certification</Button>
    </div>
  );
}

// --- Achievements ---
const blankAch = () => ({ id: generateId(), title: '', description: '', date: '' });

export function AchievementsEditor({ data, onChange }) {
  const add = () => onChange([...data, blankAch()]);
  const update = (id, patch) => onChange(data.map(a => a.id === id ? { ...a, ...patch } : a));
  const remove = (id) => onChange(data.filter(a => a.id !== id));

  return (
    <div className="space-y-3 animate-fade-in">
      {data.map(a => (
        <div key={a.id} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)] space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Title" value={a.title} onChange={e => update(a.id, { title: e.target.value })} placeholder="Engineering Excellence Award" />
                <Input label="Date" type="month" value={a.date} onChange={e => update(a.id, { date: e.target.value })} />
              </div>
              <Textarea label="Description" rows={2} value={a.description} onChange={e => update(a.id, { description: e.target.value })} placeholder="Describe this achievement..." />
            </div>
            <button onClick={() => remove(a.id)} className="text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-900/20 w-7 h-7 flex items-center justify-center rounded text-sm self-start mt-5">✕</button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">+ Add Achievement</Button>
    </div>
  );
}

// --- Languages ---
const PROFICIENCIES = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Beginner'];

export function LanguagesEditor({ data, onChange }) {
  const add = () => onChange([...data, { id: generateId(), language: '', proficiency: 'Intermediate' }]);
  const update = (id, patch) => onChange(data.map(l => l.id === id ? { ...l, ...patch } : l));
  const remove = (id) => onChange(data.filter(l => l.id !== id));

  return (
    <div className="space-y-2 animate-fade-in">
      {data.map(l => (
        <div key={l.id} className="flex gap-2 items-center">
          <input
            value={l.language}
            onChange={e => update(l.id, { language: e.target.value })}
            placeholder="Language"
            className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <select
            value={l.proficiency}
            onChange={e => update(l.id, { proficiency: e.target.value })}
            className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={() => remove(l.id)} className="w-8 h-8 flex items-center justify-center text-[var(--destructive)] rounded hover:bg-red-50 dark:hover:bg-red-900/20">✕</button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">+ Add Language</Button>
    </div>
  );
}

// --- Interests ---
export function InterestsEditor({ data, onChange }) {
  const [input, setInput] = useState('');
  const add = () => {
    const val = input.trim();
    if (!val || data.includes(val)) return;
    onChange([...data, val]);
    setInput('');
  };
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {data.map(i => (
          <span key={i} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] font-medium">
            {i}
            <button onClick={() => onChange(data.filter(x => x !== i))} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] leading-none">×</button>
          </span>
        ))}
        {data.length === 0 && <p className="text-sm text-[var(--muted-foreground)]">No interests added yet</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Rock climbing, Coffee brewing..."
          className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <Button size="sm" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

// --- Custom Sections ---
export function CustomSectionEditor({ data, onChange }) {
  const add = () => onChange([...data, { id: generateId(), title: 'Custom Section', items: [] }]);
  const updateSection = (id, patch) => onChange(data.map(s => s.id === id ? { ...s, ...patch } : s));
  const remove = (id) => onChange(data.filter(s => s.id !== id));

  const addItem = (sectionId) => {
    const s = data.find(x => x.id === sectionId);
    if (!s) return;
    updateSection(sectionId, { items: [...s.items, { id: generateId(), title: '', subtitle: '', date: '', description: '' }] });
  };

  const updateItem = (sectionId, itemId, patch) => {
    const s = data.find(x => x.id === sectionId);
    if (!s) return;
    updateSection(sectionId, { items: s.items.map(i => i.id === itemId ? { ...i, ...patch } : i) });
  };

  const removeItem = (sectionId, itemId) => {
    const s = data.find(x => x.id === sectionId);
    if (!s) return;
    updateSection(sectionId, { items: s.items.filter(i => i.id !== itemId) });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {data.map(s => (
        <div key={s.id} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]">
          <div className="flex gap-2 mb-3">
            <input value={s.title} onChange={e => updateSection(s.id, { title: e.target.value })} className="flex-1 font-semibold text-sm px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" placeholder="Section title" />
            <button onClick={() => remove(s.id)} className="text-[var(--destructive)] px-2 py-1 text-sm rounded hover:bg-red-50 dark:hover:bg-red-900/20">Remove</button>
          </div>
          <div className="space-y-3">
            {s.items.map(item => (
              <div key={item.id} className="grid grid-cols-2 gap-2 p-3 bg-[var(--muted)] rounded-lg relative">
                <button onClick={() => removeItem(s.id, item.id)} className="absolute top-2 right-2 text-[var(--destructive)] text-xs">✕</button>
                <Input label="Title" value={item.title} onChange={e => updateItem(s.id, item.id, { title: e.target.value })} placeholder="Item title" />
                <Input label="Date" value={item.date} onChange={e => updateItem(s.id, item.id, { date: e.target.value })} placeholder="2023" />
                <Input label="Subtitle" value={item.subtitle} onChange={e => updateItem(s.id, item.id, { subtitle: e.target.value })} placeholder="Organization / location" className="col-span-2" />
                <Textarea label="Description" rows={2} value={item.description} onChange={e => updateItem(s.id, item.id, { description: e.target.value })} placeholder="Description..." className="col-span-2" />
              </div>
            ))}
            <button onClick={() => addItem(s.id)} className="text-xs text-[var(--primary)] hover:underline">+ Add item</button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">+ Add Custom Section</Button>
    </div>
  );
}
