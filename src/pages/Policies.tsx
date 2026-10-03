import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { date, inr } from '@/lib/format';
import type { Policy } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/tabs';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Dialog, SheetContent } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState, ErrorState } from '@/components/ui/empty';

export default function Policies() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState('');
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['policies'], queryFn: () => api<Policy[]>('/policies') });
  const rows = (data ?? []).filter((p) => !q || `${p.policyNumber} ${p.user?.name}`.toLowerCase().includes(q.toLowerCase()));
  const open = data?.find((p) => p.id === sp.get('open'));
  return (
    <div className="animate-fade-in">
      <PageHeader title="Policies" description="Policies read by the AI. Rules here drive every coverage check and settlement." />
      <Card className="overflow-hidden">
        <div className="border-b border-line p-4"><Input icon={<Search />} placeholder="Search by policy number or holder" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" /></div>
        {error ? <ErrorState error={error} onRetry={() => refetch()} /> : isLoading ? <TableSkeleton /> : !rows.length ? <EmptyState icon={<ShieldCheck />} title={data?.length ? 'No policies match' : 'No policies yet'} description={data?.length ? undefined : 'Policies linked from the mobile app appear here.'} /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead><tr className="border-b border-line bg-[#FAFCFE] text-[11px] font-semibold tracking-[0.06em] text-subtle uppercase"><th className="px-6 py-3">Holder</th><th className="px-4 py-3">Policy</th><th className="px-4 py-3 text-right">Sum insured</th><th className="px-4 py-3 text-right">Room cap</th><th className="px-4 py-3">Co-pay</th><th className="px-4 py-3">Since</th><th className="px-6 py-3 text-right">Claims</th></tr></thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => (
                  <tr key={p.id} onClick={() => setSp({ open: p.id })} className="cursor-pointer hover:bg-[#F7FBFE]">
                    <td className="px-6 py-3.5"><div className="flex items-center gap-3"><Avatar name={p.user?.name} /><div><div className="font-medium text-ink">{p.user?.name}</div><div className="text-xs text-muted">{p.user?.email}</div></div></div></td>
                    <td className="px-4 py-3.5"><div className="tabular tracking-tight text-[13px] text-navy">{p.policyNumber}</div><div className="text-xs text-muted">{p.insurer}</div></td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums">{inr(p.sumInsured)}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums">{inr(p.roomRentLimit)}/day</td>
                    <td className="px-4 py-3.5"><Badge tone="primary">{p.coPayPercent}%</Badge></td>
                    <td className="px-4 py-3.5 text-muted">{date(p.startDate)}</td>
                    <td className="px-6 py-3.5 text-right tabular-nums">{p._count?.claims ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Dialog open={!!open} onOpenChange={(o) => !o && setSp({})}>
        {open && (
          <SheetContent title={open.policyNumber} description={`${open.insurer}${open.planName ? ` · ${open.planName}` : ''} · ${open.user?.name}`}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[['Sum insured', inr(open.sumInsured)], ['Room rent cap', `${inr(open.roomRentLimit)}/day`], ['ICU cap', open.icuLimit ? `${inr(open.icuLimit)}/day` : '—'], ['Co-pay', `${open.coPayPercent}%`], ['Start', date(open.startDate)], ['End', date(open.endDate)]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-canvas p-3"><div className="text-xs text-muted">{k}</div><div className="mt-0.5 font-semibold text-ink">{v}</div></div>
                ))}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between"><h4 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-primary" />AI summary</h4><Segmented value={lang} onChange={setLang} options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिंदी' }]} /></div>
                <p className="rounded-xl border border-line p-4 text-[13px] leading-relaxed whitespace-pre-line text-ink">{(lang === 'hi' ? open.summaryHindi : open.summary) || 'No summary yet.'}</p>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Waiting periods</h4>
                <div className="space-y-1.5">{!open.waitingPeriods?.length && <p className="text-[13px] text-muted">None recorded.</p>}{(open.waitingPeriods ?? []).map((w) => <div key={w.name} className="flex justify-between rounded-lg bg-canvas px-3 py-2 text-[13px]"><span className="text-muted">{w.name}</span><span className="font-medium">{w.months} months</span></div>)}</div>
              </div>
              {!!open.members?.length && <div><h4 className="mb-2 text-sm font-semibold">Insured members</h4><div className="space-y-1.5">{open.members.map((m, i) => <div key={i} className="flex justify-between rounded-lg bg-canvas px-3 py-2 text-[13px]"><span className="text-ink">{m.name}</span><span className="text-muted">{m.relation ?? '—'}</span></div>)}</div></div>}
              {open.subLimits && <div><h4 className="mb-2 text-sm font-semibold">Sub-limits</h4><div className="space-y-1.5">{Object.entries(open.subLimits).map(([k, v]) => <div key={k} className="flex justify-between rounded-lg bg-canvas px-3 py-2 text-[13px]"><span className="text-muted">{k.replace(/_/g, ' ')}</span><span className="font-medium">{inr(v)}</span></div>)}</div></div>}
              <div><h4 className="mb-2 text-sm font-semibold">Exclusions</h4><div className="flex flex-wrap gap-1.5">{!open.exclusions?.length && <p className="text-[13px] text-muted">None recorded.</p>}{(open.exclusions ?? []).map((e) => <Badge key={e}>{e}</Badge>)}</div></div>
            </div>
          </SheetContent>
        )}
      </Dialog>
    </div>
  );
}
