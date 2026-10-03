import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, Bot, Building2, CalendarDays, Check, CheckCircle2, CircleDashed, Eye, FileText, HelpCircle, IndianRupee, MessageSquareText, RefreshCw, ShieldCheck, Sparkles, Upload, User, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ago, date, dateTime, docLabel, inr } from '@/lib/format';
import { CLAIM_STATUS } from '@/lib/status';
import { cn } from '@/lib/utils';
import type { ClaimDetail as CD, Doc } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, ConfidencePill, DocStatusBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/ui/dropdown';
import { DecisionDialog, QueryDialog, useDecision } from '@/components/decision';
import { DocPreviewDialog } from '@/components/docs';
import { ActivityRow } from '@/components/activity';

const suggestionLabel: Record<string, string> = { APPROVE: 'Approve in full', PARTIAL_APPROVE: 'Partial approval', REJECT: 'Reject', REQUEST_INFO: 'Ask for more info', APPROVE_PREAUTH: 'Approve pre-auth' };

export default function ClaimDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: c, isLoading, error } = useQuery({ queryKey: ['claim', id], queryFn: () => api<CD>(`/claims/${id}`), refetchInterval: 4000 });
  const [dlg, setDlg] = useState<'APPROVE' | 'REJECT' | 'QUERY' | null>(null);
  const [preview, setPreview] = useState<Doc | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const settle = useDecision(c ?? { id: '', claimNumber: '' });
  const rerun = useMutation({ mutationFn: () => api(`/claims/${c!.id}/rerun-ai`, { method: 'POST' }), onSuccess: () => (qc.invalidateQueries({ queryKey: ['claim', id] }), toast.success('Claim Agent re-checked this claim')) });
  const review = useMutation({
    mutationFn: (b: { docId: string; status: 'VERIFIED' | 'NEEDS_REVIEW' | 'INVALID' }) => api(`/documents/${b.docId}/review`, { method: 'PATCH', json: { status: b.status } }),
    onSuccess: (_d, b) => (qc.invalidateQueries(), toast.success(`Document marked ${b.status.replace('_', ' ').toLowerCase()}`)),
    onError: (e: Error) => toast.error(e.message),
  });
  const upload = useMutation({
    mutationFn: (f: File) => {
      const fd = new FormData();
      fd.append('file', f);
      return api(`/claims/${c!.id}/documents`, { method: 'POST', body: fd });
    },
    onSuccess: () => (qc.invalidateQueries(), toast.success('Uploaded. The Claim Agent is checking it now.')),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="space-y-5"><Skeleton className="h-36 w-full rounded-2xl" /><div className="grid gap-5 xl:grid-cols-3"><Skeleton className="h-96 rounded-2xl xl:col-span-2" /><Skeleton className="h-96 rounded-2xl" /></div></div>;
  if (error || !c) return <Card><EmptyState icon={<FileText />} title="Claim not found" description={(error as Error)?.message} action={<Link to="/claims"><Button variant="outline"><ArrowLeft /> Back to claims</Button></Link>} /></Card>;

  const sug = c.aiSuggestion && !c.aiSuggestion.resolved ? c.aiSuggestion : null;
  const canDecide = !['APPROVED', 'REJECTED', 'SETTLED'].includes(c.status);
  const summaryLines = (c.aiSummary ?? '').split('\n').filter(Boolean);
  const s = c.settlement;
  const docsDone = c.checklist.verified.length;

  return (
    <div className="animate-fade-in space-y-5">
      <Link to="/claims" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"><ArrowLeft className="size-4" /> All claims</Link>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${CLAIM_STATUS[c.status].chart}, ${CLAIM_STATUS[c.status].chart}33)` }} />
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-[-0.025em] text-ink">{c.claimNumber}</h1>
              <StatusBadge status={c.status} />
              <Badge tone={c.claimType === 'CASHLESS' ? 'violet' : 'neutral'}>{c.claimType === 'CASHLESS' ? 'Cashless' : 'Reimbursement'}</Badge>
              {c.riskLevel && c.riskLevel !== 'LOW' && <Badge tone={c.riskLevel === 'HIGH' ? 'error' : 'warning'}><AlertTriangle />{c.riskLevel === 'HIGH' ? 'High risk' : 'Medium risk'}</Badge>}
            </div>
            <p className="mt-1.5 text-[15px] text-ink">{c.reason}{c.treatment ? <span className="text-muted"> · {c.treatment}</span> : null}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
              <span className="flex items-center gap-1.5"><User className="size-4 text-subtle" />{c.patientName}</span>
              <span className="flex items-center gap-1.5"><Building2 className="size-4 text-subtle" />{c.hospital}{c.hospitalCity ? `, ${c.hospitalCity}` : ''}</span>
              <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-subtle" />{date(c.admissionDate)} → {date(c.dischargeDate)}{c.days ? ` · ${c.days} days` : ''}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-subtle" />{c.policy?.policyNumber} · {c.policy?.insurer}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
            <div className="flex gap-6 lg:text-right">
              <div>
                <div className="text-xs text-muted">{c.billAmount ? 'Bill amount' : 'Estimate'}</div>
                <div className="text-xl font-semibold text-ink tabular-nums">{inr(c.billAmount ?? c.estimatedAmount)}</div>
              </div>
              {s && (
                <div>
                  <div className="text-xs text-muted">{s.status === 'ESTIMATED' ? 'Payable (est.)' : 'Approved'}</div>
                  <div className="text-xl font-semibold text-success tabular-nums">{inr(s.approvedAmount)}</div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => rerun.mutate()} loading={rerun.isPending}><RefreshCw /> Re-run AI</Button>
              <Button variant="outline" size="sm" onClick={() => setDlg('QUERY')}><HelpCircle /> Raise query</Button>
              {canDecide && <Button variant="soft-danger" size="sm" onClick={() => setDlg('REJECT')}><XCircle /> Reject</Button>}
              {canDecide && <Button variant="success" size="sm" onClick={() => setDlg('APPROVE')}><CheckCircle2 /> Approve</Button>}
              {c.status === 'APPROVED' && <Button variant="navy" size="sm" loading={settle.isPending} onClick={() => settle.mutate({ decision: 'SETTLE' })}><IndianRupee /> Mark paid</Button>}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          {/* AI summary */}
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl" />
            <CardHeader title="AI summary" description="Written by the Claim Agent from the documents and policy" icon={<Sparkles />} action={<div className="flex items-center gap-2 text-xs text-muted">Confidence <ConfidencePill value={c.aiConfidence} /></div>} />
            <CardBody>
              {summaryLines.length ? (
                <ol className="space-y-2.5">
                  {summaryLines.map((l, i) => (
                    <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-primary-50 text-[11px] font-semibold text-primary-700">{i + 1}</span>
                      {l}
                    </li>
                  ))}
                </ol>
              ) : <p className="text-sm text-muted">No summary yet. The agent writes one once the documents are in.</p>}
              {sug && (
                <div className="mt-5 flex flex-col gap-3 rounded-xl border border-primary/25 bg-gradient-to-r from-primary-50 to-white p-4 sm:flex-row sm:items-center">
                  <Bot className="size-5 shrink-0 text-primary-700" />
                  <div className="flex-1 text-[13px]">
                    <div className="font-semibold text-navy">AI suggests: {suggestionLabel[sug.decision] ?? sug.decision}{sug.amount != null ? ` · ${inr(sug.amount)}` : ''}</div>
                    <div className="mt-0.5 text-muted">Reason: {sug.reason}</div>
                  </div>
                  {canDecide && <Button size="sm" variant={sug.decision === 'REJECT' ? 'danger' : 'primary'} onClick={() => setDlg(sug.decision === 'REJECT' ? 'REJECT' : sug.decision === 'REQUEST_INFO' ? 'QUERY' : 'APPROVE')}>Accept suggestion</Button>}
                </div>
              )}
              {!!c.riskFlags?.length && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.riskFlags.map((f) => <Badge key={f} tone="warning">{f.replace(/_/g, ' ').toLowerCase()}</Badge>)}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader
              title="Documents"
              description={`${docsDone} of ${c.checklist.required.length} required documents verified${c.checklist.missing.length ? ` · missing ${c.checklist.missing.map((m) => docLabel(m).toLowerCase()).join(', ')}` : ''}`}
              icon={<FileText />}
              action={
                <>
                  <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload.mutate(e.target.files[0])} />
                  <Button size="sm" variant="soft" onClick={() => fileRef.current?.click()} loading={upload.isPending}><Upload /> Upload</Button>
                </>
              }
            />
            <div className="px-6 pb-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF2F7]">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all" style={{ width: `${(docsDone / Math.max(1, c.checklist.required.length)) * 100}%` }} />
              </div>
            </div>
            <div className="divide-y divide-line">
              {c.documents.map((d) => (
                <div key={d.id} className="flex items-center gap-4 px-6 py-3">
                  <button onClick={() => setPreview(d)} className={cn('grid size-10 shrink-0 place-items-center rounded-xl transition hover:scale-105', d.status === 'VERIFIED' ? 'bg-success-50 text-success' : d.status === 'INVALID' ? 'bg-error-50 text-error' : 'bg-warning-50 text-warning')}>
                    <FileText className="size-[18px]" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{docLabel(d.type)}</span>
                      <DocStatusBadge status={d.status} />
                      <ConfidencePill value={d.confidence} />
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted">{d.status !== 'VERIFIED' && d.validationResult?.fix ? d.validationResult.fix : d.validationResult?.summary ?? d.fileName}</div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => setPreview(d)}><Eye /></Button>
                  <Dropdown>
                    <DropdownTrigger asChild><Button variant="outline" size="sm">Override</Button></DropdownTrigger>
                    <DropdownContent>
                      <DropdownItem onSelect={() => review.mutate({ docId: d.id, status: 'VERIFIED' })}><Check className="!text-success" /> Mark verified</DropdownItem>
                      <DropdownItem onSelect={() => review.mutate({ docId: d.id, status: 'NEEDS_REVIEW' })}><CircleDashed className="!text-warning" /> Needs review</DropdownItem>
                      <DropdownItem onSelect={() => review.mutate({ docId: d.id, status: 'INVALID' })}><XCircle className="!text-error" /> Mark invalid &amp; ask re-upload</DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                </div>
              ))}
              {c.checklist.missing.map((m) => (
                <div key={m} className="flex items-center gap-4 bg-[#FFFBF3] px-6 py-3">
                  <div className="grid size-10 place-items-center rounded-xl border border-dashed border-warning/60 text-warning"><CircleDashed className="size-[18px]" /></div>
                  <div className="flex-1"><div className="text-sm font-medium text-ink">{docLabel(m)}</div><div className="text-xs text-[#A86500]">Missing. The agent has asked the customer for it.</div></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Settlement */}
          <Card>
            <CardHeader title="Settlement breakdown" description={s ? `Calculated by the rules engine · ${s.status.toLowerCase()}` : 'Calculated once the bill is verified'} icon={<IndianRupee />} action={s?.utr && <Badge tone="success">UTR {s.utr}</Badge>} />
            <CardBody>
              {!s ? <EmptyState className="py-8" icon={<IndianRupee />} title="Not calculated yet" description="The agent calculates the payout once the hospital bill is verified." /> : (
                <div className="space-y-1">
                  <Row label="Bill amount" value={inr(s.billAmount)} strong />
                  {s.deductions.map((d, i) => (
                    <div key={i} className="flex items-start justify-between gap-6 rounded-xl px-3 py-2.5 hover:bg-canvas">
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-ink">{d.label}</div>
                        <div className="mt-0.5 text-xs leading-relaxed text-muted">{d.reason}</div>
                        {d.clause && <div className="mt-1 text-[11px] text-subtle italic">Policy: {d.clause}</div>}
                      </div>
                      <div className="shrink-0 text-[13px] font-semibold text-error tabular-nums">−{inr(d.amount)}</div>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-gradient-to-r from-success-50 to-white px-4 py-3.5">
                    <span className="text-sm font-semibold text-ink">Payable to customer</span>
                    <span className="text-xl font-semibold text-success tabular-nums">{inr(s.approvedAmount)}</span>
                  </div>
                  {s.explanation && <p className="px-1 pt-2 text-xs leading-relaxed text-muted">{s.explanation}</p>}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Agent log */}
          <Card>
            <CardHeader title="Agent decisions" description="Every action on this claim, with the reason" icon={<Bot />} />
            <div className="max-h-[420px] divide-y divide-line overflow-y-auto border-t border-line scrollbar-thin">
              {c.activities.map((a) => <ActivityRow key={a.id} a={a} />)}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Timeline */}
          <Card>
            <CardHeader title="Timeline" description={`Last activity ${ago(c.lastActivityAt)}`} />
            <CardBody>
              <ol className="relative">
                {c.events.map((e, i) => {
                  const last = i === c.events.length - 1;
                  return (
                    <li key={e.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                      {!last && <span className="absolute top-7 bottom-0 left-[11px] w-px bg-line" />}
                      <span className={cn('relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ring-4 ring-white', last ? 'bg-primary text-white' : 'bg-[#E8F7FD] text-primary-700')}>
                        {e.actor === 'AI' ? <Sparkles className="size-3" /> : e.actor === 'HUMAN' ? <User className="size-3" /> : <Check className="size-3" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-ink">{e.title}</div>
                        {e.description && <p className="mt-0.5 text-xs leading-relaxed text-muted">{e.description}</p>}
                        <div className="mt-1 text-[11px] text-subtle">{dateTime(e.createdAt)} · {e.actor === 'AI' ? 'Claim Agent' : e.actor === 'HUMAN' ? 'Ops' : 'System'}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardBody>
          </Card>

          {/* Queries */}
          <Card>
            <CardHeader title="Queries" icon={<MessageSquareText />} action={<Button size="sm" variant="ghost" onClick={() => setDlg('QUERY')}>New</Button>} />
            <CardBody className="space-y-3">
              {!c.queries.length && <p className="rounded-xl bg-canvas px-4 py-5 text-center text-[13px] text-muted">No queries on this claim.</p>}
              {c.queries.map((q) => (
                <div key={q.id} className="rounded-xl border border-line p-3.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <Badge tone={q.status === 'OPEN' ? 'warning' : q.status === 'ANSWERED' ? 'primary' : 'success'}>{q.status.toLowerCase()}</Badge>
                    <span className="text-[11px] text-subtle">{q.createdBy === 'AI' ? 'by AI' : 'by ops'} · {ago(q.createdAt)}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink">{q.message}</p>
                  {q.response && <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-xs text-muted">↳ {q.response}</p>}
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Policy */}
          <Card>
            <CardHeader title="Policy" icon={<ShieldCheck />} />
            <CardBody className="space-y-0.5 text-[13px]">
              <Row label="Sum insured" value={inr(c.policy?.sumInsured)} />
              <Row label="Room rent cap" value={`${inr(c.policy?.roomRentLimit)}/day`} />
              <Row label="ICU cap" value={c.policy?.icuLimit ? `${inr(c.policy.icuLimit)}/day` : '—'} />
              <Row label="Co-pay" value={`${c.policy?.coPayPercent ?? 0}%`} />
              <Row label="Cover started" value={date(c.policy?.startDate)} />
              <Row label="Customer" value={c.user?.phone ?? c.user?.email ?? '—'} />
            </CardBody>
          </Card>
        </div>
      </div>

      <DecisionDialog key={`a${c.id}${dlg}`} claim={c} mode="APPROVE" open={dlg === 'APPROVE'} onOpenChange={(o) => setDlg(o ? 'APPROVE' : null)} suggested={sug?.amount ?? s?.approvedAmount} />
      <DecisionDialog key={`r${c.id}${dlg}`} claim={c} mode="REJECT" open={dlg === 'REJECT'} onOpenChange={(o) => setDlg(o ? 'REJECT' : null)} />
      <QueryDialog claim={c} open={dlg === 'QUERY'} onOpenChange={(o) => setDlg(o ? 'QUERY' : null)} />
      <DocPreviewDialog doc={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2">
      <span className="text-muted">{label}</span>
      <span className={cn('tabular-nums', strong ? 'text-[15px] font-semibold text-ink' : 'font-medium text-ink')}>{value}</span>
    </div>
  );
}
