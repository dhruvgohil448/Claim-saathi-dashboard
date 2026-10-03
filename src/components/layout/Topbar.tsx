import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, FileStack, LogOut, Menu, RotateCcw, Search, ShieldCheck, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ago } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/badge';
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownSeparator, DropdownTrigger } from '@/components/ui/dropdown';
import type { ClaimStatus, Notification } from '@/lib/types';

interface SearchRes { claims: { id: string; claimNumber: string; patientName: string; hospital: string; status: ClaimStatus }[]; users: { id: string; name: string; email: string; role: string }[]; policies: { id: string; policyNumber: string; user: { name: string } }[] }

function GlobalSearch() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const { data } = useQuery({ queryKey: ['search', q], queryFn: () => api<SearchRes>(`/search?q=${encodeURIComponent(q)}`), enabled: q.trim().length >= 2, refetchInterval: false });
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  const go = (to: string) => {
    setOpen(false);
    setQ('');
    nav(to);
  };
  const has = data && (data.claims.length || data.users.length || data.policies.length);
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
      <input
        ref={ref}
        value={q}
        onChange={(e) => (setQ(e.target.value), setOpen(true))}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search claims, patients, policies…"
        className="h-10 w-full rounded-xl border border-transparent bg-[#F1F4F8] pr-14 pl-9 text-sm outline-none transition placeholder:text-subtle focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/15"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-md border border-line-strong bg-white px-1.5 py-0.5 text-[10px] font-medium text-subtle sm:block">⌘K</kbd>
      {open && q.trim().length >= 2 && (
        <div className="absolute top-12 right-0 left-0 z-50 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-pop animate-fade-in">
          {!has && <div className="px-3 py-6 text-center text-sm text-muted">No results for “{q}”</div>}
          {data?.claims.map((c) => (
            <button key={c.id} onMouseDown={() => go(`/claims/${c.claimNumber}`)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-canvas">
              <FileStack className="size-4 text-subtle" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{c.claimNumber} · {c.patientName}</div>
                <div className="truncate text-xs text-muted">{c.hospital}</div>
              </div>
              <StatusBadge status={c.status} />
            </button>
          ))}
          {data?.policies.map((p) => (
            <button key={p.id} onMouseDown={() => go(`/policies?open=${p.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-canvas">
              <ShieldCheck className="size-4 text-subtle" />
              <span className="text-sm">{p.policyNumber} · <span className="text-muted">{p.user.name}</span></span>
            </button>
          ))}
          {data?.users.map((u) => (
            <button key={u.id} onMouseDown={() => go('/users')} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-canvas">
              <UserIcon className="size-4 text-subtle" />
              <span className="text-sm">{u.name} <span className="text-muted">· {u.email}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const notifDot: Record<Notification['type'], string> = { INFO: 'bg-primary', SUCCESS: 'bg-success', WARNING: 'bg-warning', ACTION_REQUIRED: 'bg-error' };

function Notifications() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ['notifications'], queryFn: () => api<{ items: Notification[]; unread: number }>('/notifications/my') });
  const readAll = useMutation({ mutationFn: () => api('/notifications/read-all', { method: 'POST' }), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
  const readOne = (n: Notification) => {
    if (!n.read) api(`/notifications/${n.id}/read`, { method: 'PATCH' }).then(() => qc.invalidateQueries({ queryKey: ['notifications'] }));
    if (n.claim) nav(`/claims/${n.claim.claimNumber}`);
  };
  return (
    <Dropdown>
      <DropdownTrigger className="relative grid size-10 place-items-center rounded-xl text-muted transition hover:bg-[#F1F4F8] hover:text-ink outline-none">
        <Bell className="size-[18px]" />
        {!!data?.unread && <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-error px-1 text-[10px] font-bold text-white ring-2 ring-white">{data.unread}</span>}
      </DropdownTrigger>
      <DropdownContent className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="text-sm font-semibold">Notifications</div>
          <button onClick={() => readAll.mutate()} className="flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline">
            <CheckCheck className="size-3.5" /> Mark all read
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-1.5 scrollbar-thin">
          {isLoading && <div className="py-10 text-center text-sm text-muted">Loading…</div>}
          {error && <div className="py-10 text-center text-sm text-error">Couldn't load notifications</div>}
          {data && !data.items.length && <div className="py-10 text-center text-sm text-muted">You're all caught up</div>}
          {data?.items.map((n) => (
            <DropdownItem key={n.id} onSelect={() => readOne(n)} className={cn('items-start gap-3 py-2.5', !n.read && 'bg-primary-50/50')}>
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', notifDot[n.type])} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold">{n.title}</span>
                  <span className="shrink-0 text-[11px] text-subtle">{ago(n.createdAt)}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">{n.body}</p>
              </div>
            </DropdownItem>
          ))}
        </div>
      </DropdownContent>
    </Dropdown>
  );
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const reset = useMutation({
    mutationFn: () => api<{ claims: number; documents: number; users: number }>('/admin/reset-demo', { method: 'POST' }),
    onSuccess: (r) => (qc.invalidateQueries(), toast.success('Demo data reset', { description: `${r.claims} claims, ${r.documents} documents and ${r.users} users restored from the seed.` })),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button onClick={onMenu} className="grid size-10 place-items-center rounded-xl text-muted hover:bg-canvas lg:hidden">
        <Menu className="size-5" />
      </button>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-1.5">
        <Notifications />
        <div className="mx-1.5 h-6 w-px bg-line" />
        <Dropdown>
          <DropdownTrigger className="flex items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 outline-none transition hover:bg-[#F1F4F8]">
            <Avatar name={user?.name} />
            <div className="hidden text-left leading-tight md:block">
              <div className="text-[13px] font-semibold text-ink">{user?.name}</div>
              <div className="text-[11px] text-subtle">{user?.role === 'ADMIN' ? 'Administrator' : 'Claims Ops'}</div>
            </div>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs text-muted">{user?.email}</div>
            </DropdownLabel>
            <DropdownSeparator />
            {user?.role === 'ADMIN' && (
              <DropdownItem onSelect={() => reset.mutate()}>
                <RotateCcw /> Reset demo data
              </DropdownItem>
            )}
            <DropdownItem onSelect={logout} className="text-error data-[highlighted]:bg-error-50 [&_svg]:text-error">
              <LogOut /> Sign out
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  );
}
