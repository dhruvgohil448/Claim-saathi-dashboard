import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { CLAIM_STATUS, DOC_STATUS } from '@/lib/status';
import type { ClaimStatus, DocStatus } from '@/lib/types';

const tones = {
  neutral: 'bg-[#F1F4F8] text-[#475467] ring-[#E1E7EF]',
  primary: 'bg-primary-50 text-[#0077A8] ring-primary-100',
  success: 'bg-success-50 text-[#08805F] ring-[#BFE8DC]',
  warning: 'bg-warning-50 text-[#A86500] ring-[#FBE1B4]',
  error: 'bg-error-50 text-[#C23B28] ring-[#F8CFC8]',
  violet: 'bg-violet-50 text-[#5B3FD9] ring-[#DDD3FF]',
  navy: 'bg-[#E8EEF7] text-navy ring-[#C9D6EA]',
};
export type Tone = keyof typeof tones;

export const Badge = ({ tone = 'neutral', className, ...p }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) => (
  <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset [&_svg]:size-3', tones[tone], className)} {...p} />
);

export function StatusBadge({ status, className }: { status: ClaimStatus; className?: string }) {
  const s = CLAIM_STATUS[status] ?? CLAIM_STATUS.CREATED;
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', s.badge, className)}>
      <span className={cn('size-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

export function DocStatusBadge({ status, className }: { status: DocStatus; className?: string }) {
  const s = DOC_STATUS[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset', s.badge, className)}>
      <span className={cn('size-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

export function ConfidencePill({ value, className }: { value?: number | null; className?: string }) {
  if (value == null) return null;
  const tone = value >= 0.8 ? 'text-[#08805F] bg-success-50' : value >= 0.6 ? 'text-[#A86500] bg-warning-50' : 'text-[#C23B28] bg-error-50';
  return <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums', tone, className)}>{Math.round(value * 100)}%</span>;
}
