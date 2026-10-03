import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileStack, MessageSquareText, Paperclip, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { ago, date, inr } from '@/lib/format';
import { CLAIM_STATUS, STATUS_ORDER } from '@/lib/status';
import type { ClaimListItem, ClaimStatus } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge, ConfidencePill, StatusBadge } from '@/components/ui/badge';
import { Input, Select } from '@/components/ui/input';
import { Segmented } from '@/components/ui/tabs';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/empty';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function Claims() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [search, setSearch] = useState(sp.get('q') ?? '');
  const status = (sp.get('status') ?? 'ALL') as ClaimStatus | 'ALL';
  const type = sp.get('type') ?? 'ALL';
  const all = useQuery({ queryKey: ['claims', 'all'], queryFn: () => api<ClaimListItem[]>('/claims?limit=200') });
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    if (v === 'ALL' || !v) n.delete(k);
    else n.set(k, v);
    setSp(n, { replace: true });
  };
  const s = search.trim().toLowerCase();
  const rows = (all.data ?? []).filter(
    (c) =>
      (status === 'ALL' || c.status === status) &&
      (type === 'ALL' || c.claimType === type) &&
      (!s || [c.claimNumber, c.patientName, c.hospital, c.reason, c.policy?.policyNumber].some((x) => x?.toLowerCase().includes(s))),
  );
  const counts = (all.data ?? []).reduce<Record<string, number>>((m, c) => ((m[c.status] = (m[c.status] ?? 0) + 1), m), {});

  return (
    <div className="animate-fade-in">
      <PageHeader title="Claims" description="Every claim the Claim Agent is working on, with live status." />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <Input icon={<Search />} placeholder="Search by claim, patient, hospital or policy…" value={search} onChange={(e) => setSearch(e.target.value)} className="lg:w-96" />
          <Select value={status} onChange={(e) => set('status', e.target.value)} className="lg:w-52">
            <option value="ALL">All statuses</option>
            {STATUS_ORDER.map((st) => <option key={st} value={st}>{CLAIM_STATUS[st].label}{counts[st] ? ` (${counts[st]})` : ''}</option>)}
          </Select>
          <Segmented value={type} onChange={(v) => set('type', v)} options={[{ value: 'ALL', label: 'All' }, { value: 'CASHLESS', label: 'Cashless' }, { value: 'REIMBURSEMENT', label: 'Reimbursement' }]} />
          <div className="text-[13px] text-muted lg:ml-auto">{rows.length} of {all.data?.length ?? '…'} claims</div>
        </div>

        {all.error ? <ErrorState error={all.error} onRetry={() => all.refetch()} /> : all.isLoading ? <TableSkeleton rows={8} cols={6} /> : !all.data?.length ? (
          <EmptyState icon={<FileStack />} title="No claims yet" description="Claims filed from the Claim Saathi app appear here as soon as they are submitted." />
        ) : !rows.length ? (
          <EmptyState icon={<FileStack />} title="No claims match" description="Try a different search or clear the filters." action={<Button variant="outline" onClick={() => (setSearch(''), setSp({}))}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-[#FAFCFE] text-[11px] font-semibold tracking-[0.06em] text-subtle uppercase">
                  <th className="px-6 py-3">Claim</th>
                  <th className="px-4 py-3">Patient &amp; hospital</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">AI</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => (
                  <tr key={c.id} onClick={() => nav(`/claims/${c.claimNumber}`)} className="group cursor-pointer transition-colors hover:bg-[#F7FBFE]">
                    <td className="px-6 py-3.5">
                      <Link to={`/claims/${c.claimNumber}`} className="tabular tracking-tight text-[13px] font-semibold text-navy group-hover:text-primary-700">{c.claimNumber}</Link>
                      <div className="mt-0.5 text-xs whitespace-nowrap text-subtle">{date(c.admissionDate)}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.patientName} />
                        <div className="min-w-0">
                          <div className="font-medium text-ink">{c.patientName}</div>
                          <div className="max-w-[280px] truncate text-xs text-muted">{c.reason} · {c.hospital}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={c.claimType === 'CASHLESS' ? 'violet' : 'neutral'}>{c.claimType === 'CASHLESS' ? 'Cashless' : 'Reimbursement'}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="font-semibold text-ink tabular-nums">{inr(c.billAmount ?? c.estimatedAmount)}</div>
                      {c.settlement?.approvedAmount != null && <div className="text-xs text-success tabular-nums">{inr(c.settlement.approvedAmount)} approved</div>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <ConfidencePill value={c.aiConfidence} />
                        <span className="flex items-center gap-0.5"><Paperclip className="size-3" />{c._count?.documents ?? 0}</span>
                        {!!c._count?.queries && <span className="flex items-center gap-0.5 text-[#C2410C]"><MessageSquareText className="size-3" />{c._count.queries}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-3.5 text-right text-xs whitespace-nowrap text-subtle">{ago(c.lastActivityAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
