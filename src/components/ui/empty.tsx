import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({ icon, title, description, action, className }: { icon: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="relative mb-4">
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-xl" />
        <div className="relative grid size-12 place-items-center rounded-2xl border border-line bg-white text-primary shadow-card [&_svg]:size-5">{icon}</div>
      </div>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Shown when an API call fails. Never falls back to fake data. */
export function ErrorState({ error, onRetry, className, title = "Couldn't load this from the server" }: { error: unknown; onRetry?: () => void; className?: string; title?: string }) {
  const msg = (error as { message?: string } | null)?.message ?? 'Unknown error';
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-error-50 text-error">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
      </div>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{msg}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-xl border border-line-strong px-3.5 py-1.5 text-[13px] font-medium text-ink hover:bg-canvas">
          Try again
        </button>
      )}
    </div>
  );
}
