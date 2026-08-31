import { clsx } from '../../utils/helpers';

const variants = {
  primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-sm',
  secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-90',
  ghost: 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
  danger: 'bg-[var(--destructive)] text-white hover:opacity-90',
  outline: 'bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
