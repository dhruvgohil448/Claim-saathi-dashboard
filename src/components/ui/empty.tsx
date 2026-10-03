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
