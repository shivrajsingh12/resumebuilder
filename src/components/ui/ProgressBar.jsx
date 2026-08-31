export default function ProgressBar({ value, label, showPercent = true, color, size = 'md' }) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-[var(--muted-foreground)]">{label}</span>}
          {showPercent && <span className="text-xs font-bold text-[var(--foreground)]">{value}%</span>}
        </div>
      )}
      <div className={`w-full ${h} bg-[var(--muted)] rounded-full overflow-hidden`}>
        <div
          className={`${h} rounded-full transition-all duration-500`}
          style={{ width: `${value}%`, background: color || 'var(--primary)' }}
        />
      </div>
    </div>
  );
}
