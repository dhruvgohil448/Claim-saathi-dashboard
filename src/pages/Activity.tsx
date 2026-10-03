import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import type { Activity } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Segmented } from '@/components/ui/tabs';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty';
import { ActivityRow } from '@/components/activity';

export default function ActivityPage() {
  const [actor, setActor] = useState<'ALL' | 'AI' | 'HUMAN'>('ALL');
  const { data, isLoading, dataUpdatedAt } = useQuery({ queryKey: ['activity', 'feed', actor], queryFn: () => api<{ items: Activity[] }>(`/activity?limit=80${actor !== 'ALL' ? `&actor=${actor}` : ''}`), refetchInterval: 3000 });
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!data) return;
    const ids = data.items.map((a) => a.id);
    if (seen.current) {
      const n = new Set(ids.filter((id) => !seen.current!.has(id)));
      if (n.size) setFresh(n);
    }
    seen.current = new Set(ids);
  }, [data]);
  useEffect(() => { seen.current = null; }, [actor]);
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AI Activity"
        eyebrow={<span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success"><span className="size-1.5 animate-pulse-ring rounded-full bg-success" />Live · refreshes every 3 s</span>}
        description="Every decision the Claim Agent and the ops team make, with the reason and confidence."
        actions={<Segmented value={actor} onChange={setActor} options={[{ value: 'ALL', label: 'Everything' }, { value: 'AI', label: 'AI only' }, { value: 'HUMAN', label: 'Humans' }]} />}
      />
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-3 text-xs text-muted">
          <span>{data?.items.length ?? 0} most recent actions</span>
          <span>Updated {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '…'}</span>
        </div>
        {isLoading ? <TableSkeleton rows={8} cols={3} /> : !data?.items.length ? <EmptyState icon={<Sparkles />} title="No activity yet" /> : (
          <div className="divide-y divide-line">{data.items.map((a) => <ActivityRow key={a.id} a={a} fresh={fresh.has(a.id)} />)}</div>
        )}
      </Card>
    </div>
  );
}
