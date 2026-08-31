import { clsx } from '../../utils/helpers';

const baseInput = 'w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all';

export function Input({ label, error, hint, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-[var(--foreground)] opacity-80">{label}</label>}
      <input className={clsx(baseInput, error && 'border-[var(--destructive)]', className)} {...props} />
      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, rows = 4, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-[var(--foreground)] opacity-80">{label}</label>}
      <textarea rows={rows} className={clsx(baseInput, 'resize-none', error && 'border-[var(--destructive)]', className)} {...props} />
      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-[var(--foreground)] opacity-80">{label}</label>}
      <select className={clsx(baseInput, 'cursor-pointer', className)} {...props}>{children}</select>
      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
    </div>
  );
}
