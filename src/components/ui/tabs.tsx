import { cn } from '@/lib/utils';

/** Segmented control used for filters and tabs. */
export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[]; className?: string }) {
  return (
    <div className={cn('inline-flex rounded-xl bg-[#EEF2F7] p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition',
            value === o.value ? 'bg-white text-ink shadow-[0_1px_3px_rgb(16_24_40/0.1)]' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
          {o.count != null && <span className={cn('rounded-md px-1.5 text-[11px] tabular-nums', value === o.value ? 'bg-primary-50 text-[#0077A8]' : 'bg-white/60 text-subtle')}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
