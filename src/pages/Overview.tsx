import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Bot, CheckCircle2, FileStack, IndianRupee, Sparkles, UserRoundCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ago, inr } from '@/lib/format';
import { CLAIM_STATUS } from '@/lib/status';
import type { Activity, Charts, ClaimListItem, Overview as OV } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { ChartTooltip, KpiCard, Trend } from '@/components/charts';
import { ActivityRow } from '@/components/activity';
import { EmptyState, ErrorState } from '@/components/ui/empty';

const shortDay = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function Overview() {
  const { user } = useAuth();
  const ov = useQuery({ queryKey: ['overview'], queryFn: () => api<OV>('/analytics/overview') });
  const ch = useQuery({ queryKey: ['charts', 14], queryFn: () => api<Charts>('/analytics/charts?days=14') });
  const claims = useQuery({ queryKey: ['claims', 'recent'], queryFn: () => api<ClaimListItem[]>('/claims?limit=6') });
  const act = useQuery({ queryKey: ['activity', 'recent'], queryFn: () => api<{ items: Activity[] }>('/activity?limit=6&actor=AI') });
  const o = ov.data;
  const hour = Number(new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const donut = o ? [{ name: 'Auto-handled by AI', value: o.autoHandled, color: '#00BAF2' }, { name: 'Escalated to human', value: o.escalated, color: '#002E6E' }] : [];
  const perDay = (ch.data?.perDay ?? []).map((d) => ({ ...d, label: shortDay(d.date) }));
  const byStatus = (ch.data?.claimsByStatus ?? []).filter((s) => s.count > 0 || ['APPROVED', 'NEEDS_HUMAN'].includes(s.status)).map((s) => ({ ...s, label: CLAIM_STATUS[s.status].label, fill: CLAIM_STATUS[s.status].chart }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${greet}, ${user?.name.split(' ')[0]}`}
        description={o ? <>The Claim Agent took <b className="font-semibold text-ink">{o.aiActions7d}</b> actions this week. <b className="font-semibold text-ink">{o.needsHuman}</b> {o.needsHuman === 1 ? 'claim needs' : 'claims need'} your decision.</> : 'Here is what the Claim Agent has been doing.'}
        actions={
          <>
            <Link to="/activity"><Button variant="outline"><Sparkles /> Live AI feed</Button></Link>
            <Link to="/needs-human"><Button><UserRoundCheck /> Review queue</Button></Link>
          </>
        }
      />

      {ov.error && <Card className="mb-4"><ErrorState error={ov.error} onRetry={() => ov.refetch()} title="Couldn't load live stats" /></Card>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard loading={!o} label="Total claims" icon={<FileStack />} value={o?.totalClaims} trend={o && <Trend value={o.claimsTrend} />} foot={o && <span>{o.claimsThisWeek} new this week</span>} />
        <KpiCard loading={!o} label="Auto-handled by AI" tone="success" icon={<Bot />} value={o && `${o.autoHandledPct}%`} trend={o && <Trend value={o.aiActionsTrend} />} foot={<span>AI actions vs last week</span>} />
        <KpiCard loading={!o} label="Needs a human" tone="error" icon={<UserRoundCheck />} value={o?.needsHuman} foot={o && <span>{o.pendingReview} in review · {o.openQueries} open {o.openQueries === 1 ? 'query' : 'queries'}</span>} />
        <KpiCard loading={!o} label="Approved payouts" tone="navy" icon={<IndianRupee />} value={o && inr(o.approvedValue, true)} foot={o && <span>of {inr(o.totalClaimValue, true)} claimed · {o.approved} approved</span>} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Agent workload" description="Actions per day over the last 14 days" action={<div className="flex items-center gap-4 text-xs text-muted"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />AI</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-navy" />Human</span></div>} />
          <CardBody className="h-[280px] pb-4">
            {ch.error ? <ErrorState error={ch.error} onRetry={() => ch.refetch()} /> : !ch.data ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perDay} margin={{ left: -18, right: 8, top: 8 }} barSize={14}>
                  <CartesianGrid vertical={false} stroke="#EEF2F6" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} interval={1} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="aiActions" name="AI actions" stackId="a" fill="#00BAF2" />
                  <Bar dataKey="humanActions" name="Human actions" stackId="a" fill="#002E6E" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="AI vs human" description="Claims handled end to end by the agent" />
          <CardBody>
            {ov.error ? <ErrorState error={ov.error} /> : !o ? <Skeleton className="mx-auto size-48 rounded-full" /> : o.autoHandled + o.escalated === 0 ? <EmptyState icon={<Bot />} title="No decided claims yet" description="This fills in once the agent has handled a claim." /> : (
              <>
                <div className="relative mx-auto h-[180px] w-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donut} dataKey="value" innerRadius={62} outerRadius={84} paddingAngle={3} cornerRadius={6} stroke="none" startAngle={90} endAngle={-270}>
                        {donut.map((d) => <Cell key={d.name} fill={d.color} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-semibold tracking-tight text-ink">{o.autoHandledPct}%</div>
                    <div className="text-[11px] font-medium text-subtle">automated</div>
                  </div>
                </div>
                <div className="mt-5 space-y-2.5">
                  {donut.map((d) => (
                    <div key={d.name} className="flex items-center justify-between rounded-xl bg-canvas px-3.5 py-2.5 text-[13px]">
                      <span className="flex items-center gap-2 text-muted"><span className="size-2.5 rounded-full" style={{ background: d.color }} />{d.name}</span>
                      <span className="font-semibold text-ink tabular-nums">{d.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-1 pt-1 text-xs text-muted">
                    <span>Avg AI confidence</span>
                    <span className="font-semibold text-success">{Math.round(o.avgConfidence * 100)}%</span>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader title="Claims by status" description="Where every claim is right now" />
          <CardBody className="h-[300px] pb-4">
            {ch.error ? <ErrorState error={ch.error} /> : !ch.data ? <Skeleton className="h-full w-full" /> : !byStatus.some((s) => s.count > 0) ? <EmptyState icon={<FileStack />} title="No claims yet" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus} layout="vertical" margin={{ left: 8, right: 16 }} barSize={14}>
                  <CartesianGrid horizontal={false} stroke="#EEF2F6" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="label" width={92} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Claims" radius={[0, 6, 6, 0]}>
                    {byStatus.map((s) => <Cell key={s.status} fill={s.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Recent claims" description="Latest activity first" action={<Link to="/claims"><Button variant="ghost" size="sm">View all <ArrowRight /></Button></Link>} />
          <div className="divide-y divide-line border-t border-line">
            {claims.error && <ErrorState error={claims.error} onRetry={() => claims.refetch()} />}
            {claims.data && !claims.data.length && <EmptyState icon={<FileStack />} title="No claims yet" description="Claims filed from the mobile app show up here instantly." />}
            {claims.isLoading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex items-center gap-4 px-6 py-3.5"><Skeleton className="size-8 rounded-full" /><Skeleton className="h-4 w-48" /><Skeleton className="ml-auto h-4 w-20" /></div>)}
            {claims.data?.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/claims/${c.claimNumber}`} className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-[#FAFCFE]">
                <Avatar name={c.patientName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">{c.patientName}</span>
                    <span className="tabular tracking-tight text-[11px] text-subtle">{c.claimNumber}</span>
                  </div>
                  <div className="truncate text-xs text-muted">{c.reason} · {c.hospital}</div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold text-ink tabular-nums">{inr(c.billAmount ?? c.estimatedAmount)}</div>
                  <div className="text-[11px] text-subtle">{ago(c.lastActivityAt)}</div>
                </div>
                <StatusBadge status={c.status} className="w-[118px] justify-center" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Latest from the Claim Agent" description="What the AI did most recently" icon={<Sparkles />} action={<Link to="/activity"><Button variant="ghost" size="sm">Open live feed <ArrowRight /></Button></Link>} />
        <div className="divide-y divide-line border-t border-line">
          {act.data?.items.map((a) => <ActivityRow key={a.id} a={a} compact />)}
          {act.data && !act.data.items.length && <EmptyState icon={<Sparkles />} title="No AI actions yet" />}
          {act.error && <ErrorState error={act.error} onRetry={() => act.refetch()} />}
          {act.isLoading && <div className="p-6"><Skeleton className="h-24 w-full" /></div>}
        </div>
      </Card>
      {o && o.needsHuman > 0 && (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl bg-gradient-to-r from-navy to-[#0A4A9E] p-5 text-white sm:flex-row sm:items-center">
          <CheckCircle2 className="size-5 text-primary" />
          <div className="flex-1 text-sm"><b>{o.needsHuman} claim{o.needsHuman > 1 ? 's' : ''}</b> waiting for a specialist. Each one has an AI summary and a suggested decision ready.</div>
          <Link to="/needs-human"><Button variant="primary" size="sm">Review now <ArrowRight /></Button></Link>
        </div>
      )}
    </div>
  );
}
