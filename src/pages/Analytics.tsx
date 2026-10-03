import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { inr, titleCase } from '@/lib/format';
import type { Charts } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartTooltip } from '@/components/charts';
import { EmptyState, ErrorState } from '@/components/ui/empty';

const shortDay = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const hrs = (h: number | null | undefined) => (h == null ? '—' : h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} days`);
const DOC_COLORS: Record<string, string> = { VERIFIED: '#0FA37F', NEEDS_REVIEW: '#F5A524', INVALID: '#E85D4A', UPLOADED: '#94A3B8' };

export default function Analytics() {
  const { data, error, refetch } = useQuery({ queryKey: ['charts', 30], queryFn: () => api<Charts>('/analytics/charts?days=30') });
  const docs = data ? Object.entries(data.documentValidation).map(([k, v]) => ({ name: titleCase(k), value: v, color: DOC_COLORS[k] ?? '#94A3B8' })) : [];
  const tat = (data?.turnaround.perDay ?? []).map((d) => ({ ...d, label: shortDay(d.date) }));
  const t = data?.turnaround;
  if (error) return <div className="animate-fade-in"><PageHeader title="Analytics" /><Card><ErrorState error={error} onRetry={() => refetch()} /></Card></div>;
  return (
    <div className="animate-fade-in">
      <PageHeader title="Analytics" description={data ? `How the Claim Agent performs, computed live from ${data.claimsByStatus.reduce((s, x) => s + x.count, 0)} claims in the database (last 30 days for daily charts).` : 'How the Claim Agent performs, computed live from the database.'} />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Bill vs approved amount" description="Per claim, after policy rules" />
          <CardBody className="h-[300px]">
            {!data ? <Skeleton className="h-full" /> : !data.settlements.length ? <EmptyState icon={<BarChart3 />} title="No settlements yet" /> : (
              <ResponsiveContainer>
                <BarChart data={data.settlements} margin={{ left: 4, right: 8 }} barGap={4}>
                  <CartesianGrid vertical={false} stroke="#EEF2F6" />
                  <XAxis dataKey="claimNumber" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickFormatter={(v) => inr(v, true)} tickLine={false} axisLine={false} width={56} />
                  <Tooltip content={<ChartTooltip fmt={(v) => inr(v)} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="bill" name="Bill" fill="#C9D6EA" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="approved" name="Approved" fill="#00BAF2" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Turnaround time"
            description={t ? `Claim filed → first decision. Median ${hrs(t.medianHours)}, average ${hrs(t.avgHours)} across ${t.decidedClaims} decided claims` : 'Claim filed → first decision'}
            icon={<Clock />}
          />
          <CardBody className="h-[300px]">
            {!data ? <Skeleton className="h-full" /> : !tat.some((d) => d.decided) ? <EmptyState icon={<Clock />} title="No decisions in the last 30 days" description="This chart fills in as claims are approved, rejected or settled." /> : (
              <ResponsiveContainer>
                <LineChart data={tat} margin={{ left: -8, right: 8 }}>
                  <CartesianGrid vertical={false} stroke="#EEF2F6" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={4} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                  <Tooltip content={<ChartTooltip fmt={(v) => hrs(v)} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="avgHours" name="Avg hours to decision" stroke="#00BAF2" strokeWidth={2.5} connectNulls dot={{ r: 3, fill: '#00BAF2' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Where the money goes" description="Total deductions by reason" />
          <CardBody className="h-[280px]">
            {!data ? <Skeleton className="h-full" /> : !data.deductionsByType.length ? <EmptyState icon={<BarChart3 />} title="No deductions yet" /> : (
              <ResponsiveContainer>
                <BarChart data={data.deductionsByType.slice(0, 6)} layout="vertical" margin={{ left: 8, right: 16 }} barSize={14}>
                  <CartesianGrid horizontal={false} stroke="#EEF2F6" />
                  <XAxis type="number" tickFormatter={(v) => inr(v, true)} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="label" width={170} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip fmt={(v) => inr(v)} />} />
                  <Bar dataKey="amount" name="Deducted" fill="#002E6E" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Document validation" description="AI result for every uploaded file" />
          <CardBody className="flex h-[280px] items-center gap-6">
            {!data ? <Skeleton className="h-full w-full" /> : !docs.length ? <EmptyState className="w-full" icon={<BarChart3 />} title="No documents yet" /> : <>
            <div className="h-full flex-1">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={docs} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={2} cornerRadius={5} stroke="none">{docs.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-44 space-y-2">{docs.map((d) => <div key={d.name} className="flex items-center justify-between text-[13px]"><span className="flex items-center gap-2 text-muted"><span className="size-2.5 rounded-full" style={{ background: d.color }} />{d.name}</span><b className="tabular-nums">{d.value}</b></div>)}</div>
            </>}
          </CardBody>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="What the agent does" description="AI actions by type, last 30 days" />
          <CardBody className="h-[280px]">
            {!data ? <Skeleton className="h-full" /> : !data.aiActionsByType.length ? <EmptyState icon={<BarChart3 />} title="No AI actions in the last 30 days" /> : (
              <ResponsiveContainer>
                <BarChart data={data.aiActionsByType.slice(0, 10).map((a) => ({ ...a, label: titleCase(a.action) }))} margin={{ left: -16, right: 8 }}>
                  <CartesianGrid vertical={false} stroke="#EEF2F6" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 10 }} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Actions" fill="#00BAF2" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
