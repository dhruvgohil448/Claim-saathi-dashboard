import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2, WifiOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { API_URL, onServerStatus } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function ServerBanner() {
  const [down, setDown] = useState(false);
  useEffect(() => onServerStatus(setDown), []);
  useEffect(() => {
    if (!down) return;
    const t = setInterval(() => fetch(`${API_URL}/api/health`).then(() => setDown(false)).catch(() => {}), 5000);
    return () => clearInterval(t);
  }, [down]);
  if (!down) return null;
  return (
    <div className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#FFF6E6] to-[#FFF1DC] px-4 py-2.5 text-[13px] text-[#8A5300] animate-slide-in">
      <WifiOff className="size-4 shrink-0" />
      <span>
        <b className="font-semibold">Can't reach the Claim Saathi server.</b> It may be waking up (free hosting sleeps after a while). We'll reconnect automatically.
      </span>
      <Loader2 className="size-3.5 animate-spin" />
    </div>
  );
}

export function AppLayout() {
  const { user, ready } = useAuth();
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('cs_sidebar') === '1');
  const [mobile, setMobile] = useState(false);
  useEffect(() => localStorage.setItem('cs_sidebar', collapsed ? '1' : '0'), [collapsed]);

  if (!ready)
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  return (
    <div className="min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobile} onCloseMobile={() => setMobile(false)} />
      <div className={cn('flex min-h-screen flex-col transition-[padding] duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <ServerBanner />
        <Topbar onMenu={() => setMobile(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.025em] text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-[14px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
