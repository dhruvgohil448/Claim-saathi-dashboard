import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Bot, CheckCircle2, Clock, FileText, HelpCircle, PartyPopper, ShieldAlert, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { ago, docLabel, inr } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AppConfig, Escalation } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge, ConfidencePill, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/empty';
import { Avatar } from '@/components/ui/avatar';
import { Segmented } from '@/components/ui/tabs';
import { DecisionDialog, QueryDialog } from '@/components/decision';

const sugTone: Record<string, string> = { APPROVE: 'text-success', PARTIAL_APPROVE: 'text-primary-700', APPROVE_PREAUTH: 'text-primary-700', REJECT: 'text-error', REQUEST_INFO: 'text-warning' };
const sugLabel: Record<string, string> = { APPROVE: 'Approve in full', PARTIAL_APPROVE: 'Partial approval', REJECT: 'Reject', REQUEST_INFO: 'Ask for more info', APPROVE_PREAUTH: 'Approve pre-auth' };

function EscalationCard({ e }: { e: Escalation }) {
  const [dlg, setDlg] = useState<'APPROVE' | 'REJECT' | 'QUERY' | null>(null);
  const sug = e.aiSuggestion;
  const lines = (e.aiSummary ?? '').split('\n').filter(Boolean).slice(0, 3);
  const flagged = e.documents.filter((d) => d.status !== 'VERIFIED');
  return (
    <Card className="overflow-hidden transition hover:shadow-card-hover">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <Avatar name={e.patientName} className="size-9" />
            <div className="mr-auto min-w-0">
              <div className="flex items-center gap-2">
                <Link to={`/claims/${e.claimNumber}`} className="font-semibold text-ink hover:text-primary-700">{e.patientName}</Link>
                <span className="tabular tracking-tight text-xs text-subtle">{e.claimNumber}</span>
              </div>
              <div className="text-xs text-muted">{e.reason} · {e.hospital}</div>
            </div>
            <Badge tone={e.kind === 'PREAUTH' ? 'violet' : 'error'}>{e.kind === 'PREAUTH' ? <><Clock /> Pre-auth</> : <><ShieldAlert /> Escalated</>}</Badge>
            {e.kind !== 'PREAUTH' && <StatusBadge status={e.status} />}
          </div>
          {e.escalationReason && <div className={cn('mt-4 rounded-xl px-3.5 py-2.5 text-[13px]', e.kind === 'PREAUTH' ? 'bg-violet-50 text-[#4A31B8]' : 'bg-error-50/60 text-[#9B2F20]')}><b className="font-semibold">Why it's here:</b> {e.escalationReason}</div>}
          <ol className="mt-4 space-y-2">
            {lines.map((l, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink"><span className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-md bg-primary-50 text-[10px] font-semibold text-primary-700">{i + 1}</span>{l}</li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="flex items-center gap-1"><FileText className="size-3.5" />{e.documents.length} docs</span>
            {flagged.map((d) => <Badge key={d.id} tone="warning">{docLabel(d.type)} {d.confidence != null ? `${Math.round(d.confidence * 100)}%` : ''}</Badge>)}
            <span className="ml-auto">{ago(e.escalatedAt)}</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-line bg-gradient-to-b from-[#F7FBFE] to-white p-6 lg:w-[320px] lg:border-t-0 lg:border-l">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-muted"><span className="flex items-center gap-1.5"><Bot className="size-4 text-primary" /> AI suggestion</span><ConfidencePill value={e.aiConfidence} /></div>
            <div className={cn('mt-2 text-lg font-semibold', sug ? sugTone[sug.decision] : 'text-ink')}>{sug ? sugLabel[sug.decision] : 'Review manually'}</div>
            <div className="mt-0.5 text-[26px] font-semibold tracking-tight text-ink tabular-nums">{inr(sug?.amount ?? e.settlement?.approvedAmount ?? e.estimatedAmount)}</div>
            <div className="mt-1 text-xs text-muted">of {inr(e.billAmount ?? e.estimatedAmount)} {e.billAmount ? 'billed' : 'estimated'}{sug?.reason ? ` · ${sug.reason}` : ''}</div>
          </div>
          <div className="space-y-2">
            <Button variant="success" className="w-full" onClick={() => setDlg(sug?.decision === 'REJECT' ? 'REJECT' : 'APPROVE')}>
              <CheckCircle2 /> {sug?.decision === 'REJECT' ? 'Accept: reject' : `Accept · ${inr(sug?.amount ?? e.settlement?.approvedAmount)}`}
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => setDlg('QUERY')}><HelpCircle /> Query</Button>
              <Button variant="soft-danger" size="sm" onClick={() => setDlg('REJECT')}><XCircle /> Reject</Button>
              <Link to={`/claims/${e.claimNumber}`}><Button variant="ghost" size="sm" className="w-full">Open <ArrowUpRight /></Button></Link>
            </div>
          </div>
        </div>
      </div>
      <DecisionDialog key={`a${dlg}`} claim={e} mode="APPROVE" open={dlg === 'APPROVE'} onOpenChange={(o) => setDlg(o ? 'APPROVE' : null)} suggested={sug?.amount ?? e.settlement?.approvedAmount} />
      <DecisionDialog key={`r${dlg}`} claim={e} mode="REJECT" open={dlg === 'REJECT'} onOpenChange={(o) => setDlg(o ? 'REJECT' : null)} />
      <QueryDialog claim={e} open={dlg === 'QUERY'} onOpenChange={(o) => setDlg(o ? 'QUERY' : null)} />
    </Card>
  );
}

export default function NeedsHuman() {
  const [tab, setTab] = useState<'ALL' | 'ESCALATION' | 'PREAUTH'>('ALL');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['escalations'], queryFn: () => api<Escalation[]>('/escalations') });
  const cfg = useQuery({ queryKey: ['config'], queryFn: () => api<AppConfig>('/config') });
  const rows = (data ?? []).filter((e) => tab === 'ALL' || e.kind === tab);
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Needs Human"
        description={`Claims the agent didn't decide alone: low confidence, high risk${cfg.data ? `, or above ${inr(cfg.data.escalationAmount)}` : ''}. Each has a summary and a suggested decision.`}
        actions={<Segmented value={tab} onChange={setTab} options={[{ value: 'ALL', label: 'All', count: data?.length }, { value: 'ESCALATION', label: 'Escalated', count: data?.filter((e) => e.kind === 'ESCALATION').length }, { value: 'PREAUTH', label: 'Pre-auth', count: data?.filter((e) => e.kind === 'PREAUTH').length }]} />}
      />
      <div className="space-y-4">
        {isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        {error && <Card><ErrorState error={error} onRetry={() => refetch()} /></Card>}
        {!isLoading && !error && !rows.length && <Card><EmptyState icon={<PartyPopper />} title="Queue is clear" description="The Claim Agent is handling everything on its own right now." /></Card>}
        {rows.map((e) => <EscalationCard key={e.id} e={e} />)}
      </div>
    </div>
  );
}
