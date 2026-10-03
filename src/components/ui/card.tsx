import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-2xl border border-line bg-white shadow-card', className)} {...p} />
);

export function CardHeader({ title, description, action, icon, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-6 pt-5 pb-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700 [&_svg]:size-4">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export const CardBody = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => <div className={cn('px-6 pb-6', className)} {...p} />;
