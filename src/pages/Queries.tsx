import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ago, docLabel } from '@/lib/format';
import type { Query } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Segmented } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/empty';

export default function Queries() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'ALL' | 'OPEN' | 'ANSWERED' | 'CLOSED'>('ALL');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['queries'], queryFn: () => api<Query[]>('/queries') });
  const close = useMutation({ mutationFn: (id: string) => api(`/queries/${id}/close`, { method: 'PATCH' }), onSuccess: () => (qc.invalidateQueries(), toast.success('Query closed')) });
  const rows = (data ?? []).filter((q) => tab === 'ALL' || q.status === tab);
  const n = (s: string) => data?.filter((q) => q.status === s).length;
  return (
    <div className="animate-fade-in">
      <PageHeader title="Queries" description="Questions sent to customers. The agent closes them automatically once the right document arrives." actions={<Segmented value={tab} onChange={setTab} options={[{ value: 'ALL', label: 'All', count: data?.length }, { value: 'OPEN', label: 'Open', count: n('OPEN') }, { value: 'ANSWERED', label: 'Answered', count: n('ANSWERED') }, { value: 'CLOSED', label: 'Closed', count: n('CLOSED') }]} />} />
      <Card className="overflow-hidden">
        {error ? <ErrorState error={error} onRetry={() => refetch()} /> : isLoading ? <TableSkeleton /> : !rows.length ? <EmptyState icon={<MessageSquareText />} title="No queries here" description="When a document is missing, the agent raises a query automatically." /> : (
          <div className="divide-y divide-line">
            {rows.map((q) => (
              <div key={q.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/claims/${q.claim?.claimNumber}`} className="tabular tracking-tight text-[13px] font-semibold text-navy hover:text-primary-700">{q.claim?.claimNumber}</Link>
                    <span className="text-sm text-ink">{q.claim?.patientName}</span>
                    {q.claim && <StatusBadge status={q.claim.status} />}
                    {q.requestedDocType && <Badge tone="primary">{docLabel(q.requestedDocType)}</Badge>}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{q.message}</p>
                  {q.response && <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-xs text-muted">↳ {q.response}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-subtle">{q.createdBy === 'AI' ? 'AI' : 'Ops'} · {ago(q.createdAt)}</span>
                  <Badge tone={q.status === 'OPEN' ? 'warning' : q.status === 'ANSWERED' ? 'primary' : 'success'}>{q.status.toLowerCase()}</Badge>
                  {q.status !== 'CLOSED' && <Button size="sm" variant="outline" onClick={() => close.mutate(q.id)}>Close</Button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
