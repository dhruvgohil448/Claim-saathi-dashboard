import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, ChevronsLeft, ChevronsRight, FileStack, FileText, LayoutDashboard, MessageSquareText, ShieldCheck, Sparkles, UserRoundCheck, Users, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/logo';
import { Tooltip } from '@/components/ui/tooltip';
import type { Escalation, Overview } from '@/lib/types';

const groups = [
  {
    label: 'Workspace',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/activity', label: 'AI Activity', icon: Sparkles, live: true },
      { to: '/claims', label: 'Claims', icon: FileStack },
      { to: '/needs-human', label: 'Needs Human', icon: UserRoundCheck, countKey: 'escalations' as const },
    ],
  },
  {
    label: 'Records',
    items: [
      { to: '/documents', label: 'Documents', icon: FileText, countKey: 'docs' as const },
      { to: '/queries', label: 'Queries', icon: MessageSquareText, countKey: 'queries' as const },
      { to: '/policies', label: 'Policies', icon: ShieldCheck },
      { to: '/users', label: 'Users', icon: Users },
    ],
  },
  { label: 'Insights', items: [{ to: '/analytics', label: 'Analytics', icon: BarChart3 }] },
];

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onCloseMobile: () => void }) {
  const esc = useQuery({ queryKey: ['escalations'], queryFn: () => api<Escalation[]>('/escalations'), refetchInterval: 15000 });
  const ov = useQuery({ queryKey: ['overview'], queryFn: () => api<Overview>('/analytics/overview'), refetchInterval: 15000 });
  const counts = { escalations: esc.data?.length, queries: ov.data?.openQueries, docs: ov.data ? (ov.data.documents.NEEDS_REVIEW ?? 0) + (ov.data.documents.INVALID ?? 0) : undefined };

  const narrow = collapsed && !mobileOpen;
  return (
    <>
      <div className={cn('fixed inset-0 z-30 bg-ink/30 backdrop-blur-[1px] lg:hidden', mobileOpen ? 'block' : 'hidden')} onClick={onCloseMobile} />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-white transition-[width,transform] duration-200 ease-out',
          narrow ? 'w-[76px]' : 'w-64',
          mobileOpen ? 'translate-x-0 shadow-pop' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-line', narrow ? 'justify-center px-0' : 'justify-between px-5')}>
          <Wordmark collapsed={narrow} />
          <button onClick={onCloseMobile} className="rounded-lg p-1.5 text-subtle hover:bg-canvas lg:hidden">
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 scrollbar-thin">
          {groups.map((g) => (
            <div key={g.label}>
              {!narrow && <div className="mb-2 px-3 text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{g.label}</div>}
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const count = 'countKey' in it && it.countKey ? counts[it.countKey] : undefined;
                  const link = (
                    <NavLink
                      to={it.to}
                      end={'end' in it ? it.end : false}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex h-10 items-center gap-3 rounded-xl text-[14px] font-medium transition-colors',
                          narrow ? 'justify-center px-0' : 'px-3',
                          isActive ? 'bg-primary-50 text-navy' : 'text-muted hover:bg-canvas hover:text-ink',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-primary" />}
                          <it.icon className={cn('size-[18px] shrink-0', isActive ? 'text-primary-700' : 'text-subtle group-hover:text-muted')} />
                          {!narrow && <span className="flex-1 truncate">{it.label}</span>}
                          {!narrow && 'live' in it && it.live && (
                            <span className="flex items-center gap-1 rounded-full bg-success-50 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                              <span className="size-1.5 animate-pulse-ring rounded-full bg-success" />
                              LIVE
                            </span>
                          )}
                          {!narrow && !!count && (
                            <span className={cn('min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums', it.to === '/needs-human' ? 'bg-error text-white' : 'bg-[#EEF2F7] text-muted')}>{count}</span>
                          )}
                          {narrow && !!count && <span className="absolute top-1.5 right-3 size-2 rounded-full bg-error ring-2 ring-white" />}
                        </>
                      )}
                    </NavLink>
                  );
                  return <li key={it.to}>{narrow ? <Tooltip content={it.label} side="right">{link}</Tooltip> : link}</li>;
                })}
              </ul>
            </div>
          ))}
        </nav>

        {!narrow && (
          <div className="mx-3 mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-[#0A4A9E] p-4 text-white">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <Activity className="size-4 text-primary" /> Claim Agent
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/70">
              {ov.data ? `Auto-handled ${ov.data.autoHandledPct}% of claims. Avg confidence ${Math.round(ov.data.avgConfidence * 100)}%.` : 'Watching every claim, document and query.'}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${ov.data?.autoHandledPct ?? 0}%` }} />
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn('hidden h-12 items-center gap-2 border-t border-line text-[13px] font-medium text-subtle transition hover:bg-canvas hover:text-ink lg:flex', narrow ? 'justify-center' : 'px-6')}
        >
          {narrow ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
        </button>
      </aside>
    </>
  );
}
