import { cn } from '@/lib/utils';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-lg bg-gradient-to-r from-[#EEF2F7] via-[#F5F8FB] to-[#EEF2F7]', className)} />
);

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={cn('h-4', j === 0 ? 'w-28' : j === 1 ? 'w-44' : 'w-20', 'flex-shrink-0')} />
          ))}
        </div>
      ))}
    </div>
  );
}
