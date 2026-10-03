import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ChartTooltip({ active, payload, label, fmt }: { active?: boolean; payload?: { name: string; value: number; color: string; payload?: Record<string, unknown> }[]; label?: string; fmt?: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-xl border border-line bg-white px-3 py-2.5 shadow-pop">
      {label && <div className="mb-1.5 text-[11px] font-medium text-subtle">{label}</div>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold text-ink tabular-nums">{fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Trend({ value, invert, suffix = '%' }: { value: number; invert?: boolean; suffix?: string }) {
  const up = value >= 0;
  const good = invert ? !up : up;
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums', good ? 'bg-success-50 text-[#08805F]' : 'bg-error-50 text-[#C23B28]')}>
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

export function KpiCard({ label, value, icon, tone = 'primary', trend, foot, loading }: { label: string; value: ReactNode; icon: ReactNode; tone?: 'primary' | 'success' | 'warning' | 'error' | 'navy'; trend?: ReactNode; foot?: ReactNode; loading?: boolean }) {
  const tones = { primary: 'bg-primary-50 text-primary-700', success: 'bg-success-50 text-success', warning: 'bg-warning-50 text-[#D18A0F]', error: 'bg-error-50 text-error', navy: 'bg-[#E8EEF7] text-navy' };
  return (
    <Card className="group relative overflow-hidden p-5 transition hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <div className={cn('grid size-9 place-items-center rounded-xl [&_svg]:size-[18px]', tones[tone])}>{icon}</div>
      </div>
      {loading ? <Skeleton className="mt-3 h-8 w-24" /> : <div className="mt-2 text-[28px] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">{value}</div>}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        {trend}
        {foot}
      </div>
    </Card>
  );
}
