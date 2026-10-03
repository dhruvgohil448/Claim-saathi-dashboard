import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FlaskConical } from 'lucide-react';
import { api } from '@/lib/api';
import { inr, titleCase } from '@/lib/format';
import type { Charts } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartTooltip } from '@/components/charts';

// Synthetic monthly series for the pitch (clearly badged as demo data).
const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const tat = months.map((m, i) => ({ month: m, before: [11.2, 10.8, 10.9, 10.4, 10.1, 9.8][i], withAi: [11.2, 7.4, 4.9, 3.1, 2.2, 1.6][i] }));
const DOC_COLORS: Record<string, string> = { VERIFIED: '#0FA37F', NEEDS_REVIEW: '#F5A524', INVALID: '#E85D4A', UPLOADED: '#94A3B8' };

export default function Analytics() {
  const { data } = useQuery({ queryKey: ['charts', 30], queryFn: () => api<Charts>('/analytics/charts?days=30') });
  const docs = data ? Object.entries(data.documentValidation).map(([k, v]) => ({ name: titleCase(k), value: v, color: DOC_COLORS[k] ?? '#94A3B8' })) : [];
  return (
    <div className="animate-fade-in">
      <PageHeader title="Analytics" eyebrow={<Badge tone="warning"><FlaskConical /> Demo data</Badge>} description="How the Claim Agent performs. Built from the 9 seeded hackathon claims plus a synthetic trend for the pitch." />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Bill vs approved amount" description="Per claim, after policy rules" />
          <CardBody className="h-[300px]">
            {!data ? <Skeleton className="h-full" /> : (
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
          <CardHeader title="Average turnaround (days)" description="Synthetic: before vs with Claim Saathi" action={<Badge tone="warning">Demo</Badge>} />
          <CardBody className="h-[300px]">
            <ResponsiveContainer>
              <LineChart data={tat} margin={{ left: -16, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#EEF2F6" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip fmt={(v) => `${v} days`} />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="before" name="Industry average" stroke="#9AA5B4" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="withAi" name="With Claim Saathi" stroke="#00BAF2" strokeWidth={2.5} dot={{ r: 3, fill: '#00BAF2' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Where the money goes" description="Total deductions by reason" />
          <CardBody className="h-[280px]">
            {!data ? <Skeleton className="h-full" /> : (
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
            <div className="h-full flex-1">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={docs} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={2} cornerRadius={5} stroke="none">{docs.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-44 space-y-2">{docs.map((d) => <div key={d.name} className="flex items-center justify-between text-[13px]"><span className="flex items-center gap-2 text-muted"><span className="size-2.5 rounded-full" style={{ background: d.color }} />{d.name}</span><b className="tabular-nums">{d.value}</b></div>)}</div>
          </CardBody>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="What the agent does" description="AI actions by type, last 30 days" />
          <CardBody className="h-[280px]">
            {!data ? <Skeleton className="h-full" /> : (
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
