import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, FileText, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ago, docLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Doc } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { ConfidencePill, DocStatusBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/empty';
import { DocPreview, ValidationPanel } from '@/components/docs';

export default function Documents() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<'ALL' | 'NEEDS_REVIEW' | 'VERIFIED' | 'INVALID'>('ALL');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['documents'], queryFn: () => api<Doc[]>('/documents') });
  const rows = (data ?? []).filter((d) => (status === 'ALL' || d.status === status) && (!q || `${d.fileName} ${d.claim?.claimNumber} ${d.claim?.patientName}`.toLowerCase().includes(q.toLowerCase())));
  const sorted = [...rows].sort((a, b) => Number(a.status === 'VERIFIED') - Number(b.status === 'VERIFIED'));
  const current = sorted.find((d) => d.id === sel) ?? sorted[0];
  const review = useMutation({
    mutationFn: (s: 'VERIFIED' | 'INVALID') => api(`/documents/${current!.id}/review`, { method: 'PATCH', json: { status: s } }),
    onSuccess: (_d, s) => (qc.invalidateQueries(), toast.success(s === 'VERIFIED' ? 'Marked verified' : 'Marked invalid. Customer asked to re-upload.')),
  });
  const count = (s: string) => data?.filter((d) => d.status === s).length;
  return (
    <div className="animate-fade-in">
      <PageHeader title="Documents" description="Everything customers uploaded, with the AI's validation for each file." actions={<Segmented value={status} onChange={setStatus} options={[{ value: 'ALL', label: 'All', count: data?.length }, { value: 'NEEDS_REVIEW', label: 'Needs review', count: count('NEEDS_REVIEW') }, { value: 'INVALID', label: 'Invalid', count: count('INVALID') }, { value: 'VERIFIED', label: 'Verified', count: count('VERIFIED') }]} />} />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="flex max-h-[calc(100vh-220px)] flex-col overflow-hidden">
          <div className="border-b border-line p-3"><Input icon={<Search />} placeholder="Search files, claims, patients" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="flex-1 divide-y divide-line overflow-y-auto scrollbar-thin">
            {isLoading && Array.from({ length: 8 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-10 w-full" /></div>)}
            {error && <ErrorState error={error} onRetry={() => refetch()} />}
            {!isLoading && !error && !sorted.length && <EmptyState icon={<FileText />} title="No documents" description={data?.length ? 'Nothing matches this filter.' : 'Documents uploaded from the app appear here.'} />}
            {sorted.map((d) => (
              <button key={d.id} onClick={() => setSel(d.id)} className={cn('flex w-full items-center gap-3 px-4 py-3 text-left transition', current?.id === d.id ? 'bg-primary-50/70' : 'hover:bg-[#FAFCFE]')}>
                <FileText className={cn('size-4 shrink-0', d.status === 'VERIFIED' ? 'text-success' : d.status === 'INVALID' ? 'text-error' : 'text-warning')} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink">{docLabel(d.type)}</div>
                  <div className="truncate text-xs text-muted">{d.claim?.claimNumber} · {d.claim?.patientName}</div>
                </div>
                <DocStatusBadge status={d.status} />
              </button>
            ))}
          </div>
        </Card>
        {current ? (
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="mr-auto min-w-0">
                <div className="flex items-center gap-2"><h3 className="font-semibold text-ink">{docLabel(current.type)}</h3><DocStatusBadge status={current.status} /><ConfidencePill value={current.confidence} /></div>
                <div className="text-xs text-muted">{current.fileName} · <Link className="text-primary-700 hover:underline" to={`/claims/${current.claim?.claimNumber}`}>{current.claim?.claimNumber}</Link> · {ago(current.createdAt)}</div>
              </div>
              <Button size="sm" variant="soft-danger" onClick={() => review.mutate('INVALID')}><XCircle /> Invalid</Button>
              <Button size="sm" variant="success" onClick={() => review.mutate('VERIFIED')}><Check /> Verify</Button>
            </div>
            <div className="grid gap-5 xl:grid-cols-[1fr_290px]">
              <DocPreview key={current.id} doc={current} className="h-[calc(100vh-330px)] min-h-[420px] w-full" />
              <ValidationPanel doc={current} />
            </div>
          </Card>
        ) : <Card><EmptyState icon={<FileText />} title={data?.length ? 'Pick a document' : 'No documents yet'} /></Card>}
      </div>
    </div>
  );
}
