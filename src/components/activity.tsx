import { Link } from 'react-router-dom';
import { AlertTriangle, Bot, CheckCircle2, FileSearch, FileWarning, HelpCircle, IndianRupee, MessageSquareReply, Send, ShieldAlert, User, Workflow, XCircle } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { ago, titleCase } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ConfidencePill } from '@/components/ui/badge';

const iconFor = (a: Activity) => {
  const x = a.action;
  if (a.actor === 'HUMAN') return { I: User, c: 'bg-[#E8EEF7] text-navy' };
  if (x.includes('ESCALAT')) return { I: ShieldAlert, c: 'bg-error-50 text-error' };
  if (x.includes('REJECT') || x.includes('INVALID')) return { I: XCircle, c: 'bg-error-50 text-error' };
  if (x.includes('FLAG') || x.includes('NEEDS_REVIEW') || x.includes('FIX')) return { I: FileWarning, c: 'bg-warning-50 text-warning' };
  if (x.includes('QUERY_CLOSED') || x.includes('ANSWER')) return { I: MessageSquareReply, c: 'bg-success-50 text-success' };
  if (x.includes('QUERY')) return { I: HelpCircle, c: 'bg-[#FFF1E7] text-[#F97316]' };
  if (x.includes('SETTLE') || x.includes('CALCULAT')) return { I: IndianRupee, c: 'bg-primary-50 text-primary-700' };
  if (x.includes('APPROV') || x.includes('VERIFIED')) return { I: CheckCircle2, c: 'bg-success-50 text-success' };
  if (x.includes('DOC') || x.includes('EXTRACT') || x.includes('VALIDAT')) return { I: FileSearch, c: 'bg-primary-50 text-primary-700' };
  if (x.includes('NOTIF') || x.includes('REMIND')) return { I: Send, c: 'bg-violet-50 text-violet' };
  if (x.includes('RISK')) return { I: AlertTriangle, c: 'bg-warning-50 text-warning' };
  if (x.includes('PREAUTH') || x.includes('STATUS')) return { I: Workflow, c: 'bg-violet-50 text-violet' };
  return { I: Bot, c: 'bg-primary-50 text-primary-700' };
};

export function ActivityRow({ a, compact, fresh }: { a: Activity; compact?: boolean; fresh?: boolean }) {
  const { I, c } = iconFor(a);
  return (
    <div className={cn('flex gap-3.5 px-6 py-3.5 transition-colors hover:bg-[#FAFCFE]', fresh && 'animate-slide-in bg-primary-50/40')}>
      <div className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl', c)}>
        <I className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[13px] font-semibold text-ink">{titleCase(a.action)}</span>
          {a.claim && (
            <Link to={`/claims/${a.claim.claimNumber}`} className="rounded-md bg-[#F1F4F8] px-1.5 py-0.5 tabular tracking-tight text-[11px] font-medium text-muted hover:bg-primary-50 hover:text-primary-700">
              {a.claim.claimNumber}
            </Link>
          )}
          <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide', a.actor === 'HUMAN' ? 'bg-[#E8EEF7] text-navy' : 'bg-primary-50 text-primary-700')}>
            {a.actor === 'HUMAN' ? (a.actorName ?? 'HUMAN').toUpperCase() : a.actor}
          </span>
          <ConfidencePill value={a.confidence} />
        </div>
        <p className={cn('mt-1 text-[13px] leading-relaxed text-muted', compact && 'line-clamp-2')}>{a.reason}</p>
      </div>
      <div className="shrink-0 pt-0.5 text-[11px] whitespace-nowrap text-subtle tabular-nums">{ago(a.createdAt)}</div>
    </div>
  );
}
