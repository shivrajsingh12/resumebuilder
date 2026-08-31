import { useRef } from 'react';
import { Input } from '../ui/Input';

export default function PersonalInfoEditor({ data, onChange }) {
  const fileRef = useRef(null);
  const set = (key, value) => onChange({ ...data, [key]: value });

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange({ ...data, photo: ev.target?.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Photo upload */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--muted)]">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--border)] flex items-center justify-center flex-shrink-0">
          {data.photo
            ? <img src={data.photo} alt="" className="w-full h-full object-cover" />
            : <span className="text-2xl text-[var(--muted-foreground)]">👤</span>
          }
        </div>
        <div>
          <button onClick={() => fileRef.current?.click()} className="text-sm font-medium text-[var(--primary)] hover:underline">
            {data.photo ? 'Change photo' : 'Upload photo'}
          </button>
          {data.photo && (
            <button onClick={() => onChange({ ...data, photo: undefined })} className="ml-3 text-sm text-[var(--destructive)] hover:underline">Remove</button>
          )}
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">JPG, PNG up to 2MB</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Full Name" value={data.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Alexandra Chen" />
        <Input label="Professional Title" value={data.title} onChange={e => set('title', e.target.value)} placeholder="Senior Software Engineer" />
        <Input label="Email" type="email" value={data.email} onChange={e => set('email', e.target.value)} placeholder="alex@email.com" />
        <Input label="Phone" type="tel" value={data.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (415) 555-0192" />
        <Input label="Location" value={data.location} onChange={e => set('location', e.target.value)} placeholder="San Francisco, CA" />
        <Input label="Website" value={data.website} onChange={e => set('website', e.target.value)} placeholder="alexchen.dev" />
        <Input label="LinkedIn" value={data.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/alexchen" />
        <Input label="GitHub" value={data.github} onChange={e => set('github', e.target.value)} placeholder="github.com/alexchen" />
      </div>
    </div>
  );
}
