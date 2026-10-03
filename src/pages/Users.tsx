import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ago, date } from '@/lib/format';
import type { Role, UserRow } from '@/lib/types';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/input';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState, ErrorState } from '@/components/ui/empty';
import { Users as UsersIcon } from 'lucide-react';

const tone = { ADMIN: 'navy', OPS: 'primary', CUSTOMER: 'neutral' } as const;

export default function Users() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['users'], queryFn: () => api<UserRow[]>('/users') });
  const m = useMutation({ mutationFn: (b: { id: string; role: Role }) => api(`/users/${b.id}/role`, { method: 'PATCH', json: { role: b.role } }), onSuccess: () => (qc.invalidateQueries({ queryKey: ['users'] }), toast.success('Role updated')), onError: (e: Error) => toast.error(e.message) });
  return (
    <div className="animate-fade-in">
      <PageHeader title="Users" description={user?.role === 'ADMIN' ? 'Customers and team members. Admins can change roles.' : 'Customers and team members.'} />
      <Card className="overflow-hidden">
        {error ? <ErrorState error={error} onRetry={() => refetch()} /> : isLoading ? <TableSkeleton /> : !data?.length ? <EmptyState icon={<UsersIcon />} title="No users yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr className="border-b border-line bg-[#FAFCFE] text-[11px] font-semibold tracking-[0.06em] text-subtle uppercase"><th className="px-6 py-3">User</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Policies / claims</th><th className="px-4 py-3">Payout bank</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Last login</th><th className="px-6 py-3">Role</th></tr></thead>
              <tbody className="divide-y divide-line">
                {data?.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAFCFE]">
                    <td className="px-6 py-3"><div className="flex items-center gap-3"><Avatar name={u.name} /><div><div className="font-medium text-ink">{u.name}</div><div className="text-xs text-muted">{u.email ?? 'Email not added yet'}</div></div></div></td>
                    <td className="px-4 py-3 text-muted tabular-nums">{u.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">{u.city ?? '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{u._count.policies} / {u._count.claims}</td>
                    <td className="px-4 py-3 text-xs text-muted">{u.bank ? <span className="text-success">{u.bank.accountNumberMasked} · {u.bank.ifsc}</span> : '—'}</td>
                    <td className="px-4 py-3 text-muted">{date(u.createdAt)}</td>
                    <td className="px-4 py-3 text-muted">{u.lastLoginAt ? ago(u.lastLoginAt) : '—'}</td>
                    <td className="px-6 py-3">
                      {user?.role === 'ADMIN' && u.id !== user.id ? (
                        <Select value={u.role} onChange={(e) => m.mutate({ id: u.id, role: e.target.value as Role })} className="w-36"><option value="CUSTOMER">Customer</option><option value="OPS">Ops</option><option value="ADMIN">Admin</option></Select>
                      ) : <Badge tone={tone[u.role]}>{u.role.toLowerCase()}</Badge>}
                    </td>
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
