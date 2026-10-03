import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, BrainCircuit, CheckCircle2, ChevronDown, HelpCircle, Receipt } from 'lucide-react';
import { api } from '@/lib/api';
import { inr } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Flag = { code: string; severity: 'high' | 'medium' | 'low'; message: string };
type Ded = { label: string; amount: number; reason: string };
type Summary = {
  summary: string; recommendation: 'APPROVE' | 'RAISE_QUERY' | 'AWAIT_REPLY' | 'REVIEW' | 'SETTLED'; recommendationLabel: string;
  confidence: number; nextAction: string; riskFlags: Flag[]; riskLevel: string; predictedPayout: number; billAmount: number; deductions: Ded[];
  documents: { verified: number; required: number };
};
type BillItem = { description: string; amount: number; payableAmount: number; status: 'PAYABLE' | 'PARTIAL' | 'NON_PAYABLE'; reason: string };
type Bill = { available: boolean; message?: string; items: BillItem[]; summary?: string; totals?: { billed: number; payableBeforeCoPay: number; coPay: number; finalPayable: number } };

const recTone = { APPROVE: 'success', RAISE_QUERY: 'warning', AWAIT_REPLY: 'neutral', REVIEW: 'error', SETTLED: 'success' } as const;
const sevTone = { high: 'error', medium: 'warning', low: 'neutral' } as const;
const itemColor = { PAYABLE: 'bg-success-50 text-[#08805F]', PARTIAL: 'bg-warning-50 text-[#A86500]', NON_PAYABLE: 'bg-error-50 text-[#C23B28]' };

export function CopilotPanel({ claimId, canDecide, onApprove, onQuery }: { claimId: string; canDecide: boolean; onApprove: () => void; onQuery: () => void }) {
  const { data: s, isLoading } = useQuery({ queryKey: ['claim-ai-summary', claimId], queryFn: () => api<Summary>(`/claims/${claimId}/ai-summary`), refetchInterval: 15000 });
  const { data: bill } = useQuery({ queryKey: ['claim-bill-analysis', claimId], queryFn: () => api<Bill>(`/claims/${claimId}/bill-analysis`), refetchInterval: 15000 });
  const [open, setOpen] = useState(false);
  return (
    <Card className="relative overflow-hidden border-primary/30">
      <div className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-violet-400/10 blur-3xl" />
      <CardHeader title="AI Copilot" description="Prediction, risk flags and recommendation from the policy rules engine" icon={<BrainCircuit />}
        action={s && <Badge tone={recTone[s.recommendation]}>{s.recommendation === 'APPROVE' || s.recommendation === 'SETTLED' ? <CheckCircle2 /> : <HelpCircle />}{s.recommendationLabel} · {Math.round(s.confidence * 100)}%</Badge>} />
      <CardBody className="space-y-4">
        {isLoading || !s ? <Skeleton className="h-24 w-full rounded-xl" /> : (
          <>
            <p className="text-[14px] leading-relaxed text-ink">{s.summary}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-primary-50 p-3"><div className="text-xs text-muted">Predicted payout</div><div className="text-lg font-semibold text-navy">{inr(s.predictedPayout)}</div><div className="text-xs text-muted">of {inr(s.billAmount)} billed</div></div>
              <div className="rounded-xl bg-[#F5F7FA] p-3"><div className="text-xs text-muted">Documents verified</div><div className="text-lg font-semibold text-ink">{s.documents.verified}/{s.documents.required}</div><div className="text-xs text-muted">Risk: {s.riskLevel.toLowerCase()}</div></div>
              <div className="rounded-xl bg-[#F5F7FA] p-3"><div className="text-xs text-muted">Next action</div><div className="text-[13px] font-medium text-ink">{s.nextAction}</div></div>
            </div>
            {!!s.riskFlags.length && (
              <div className="space-y-1.5">
                {s.riskFlags.map((f) => (
                  <div key={f.code} className="flex items-start gap-2 text-[13px]"><Badge tone={sevTone[f.severity]}><AlertTriangle />{f.severity}</Badge><span className="text-ink">{f.message}</span></div>
                ))}
              </div>
            )}
            <div className="space-y-1 text-[13px]">
              {s.deductions.map((d) => <div key={d.label} className="flex justify-between gap-3"><span className="text-muted">{d.label}</span><span className="font-medium text-[#C23B28]">−{inr(d.amount)}</span></div>)}
            </div>
            {bill?.available && (
              <div className="rounded-xl border border-[#E1E7EF]">
                <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-[13px] font-medium text-ink"><span className="flex items-center gap-2"><Receipt className="size-4 text-primary-700" />Bill analysis · {bill.summary}</span><ChevronDown className={cn('size-4 shrink-0 transition', open && 'rotate-180')} /></button>
                {open && (
                  <div className="divide-y divide-[#E1E7EF] border-t border-[#E1E7EF]">
                    {bill.items.map((i) => (
                      <div key={i.description} className="flex items-start justify-between gap-3 px-3 py-2 text-[13px]">
                        <div><div className="text-ink">{i.description}</div><div className="text-xs text-muted">{i.reason}</div></div>
                        <div className="text-right"><span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', itemColor[i.status])}>{i.status === 'PAYABLE' ? 'Payable' : i.status === 'PARTIAL' ? 'Partial' : 'Not payable'}</span><div className="mt-1 text-xs text-muted">{inr(i.payableAmount)} / {inr(i.amount)}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {canDecide && (s.recommendation === 'APPROVE' || s.recommendation === 'RAISE_QUERY') && (
              <div className="flex justify-end">
                {s.recommendation === 'APPROVE' ? <Button size="sm" variant="success" onClick={onApprove}><CheckCircle2 /> Approve {inr(s.predictedPayout)}</Button> : <Button size="sm" variant="outline" onClick={onQuery}><HelpCircle /> Raise query</Button>}
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
