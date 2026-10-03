import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BadgeCheck, Bot, FileCheck2, Lock, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { ago, titleCase } from '@/lib/format';
import type { PublicSummary } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Wordmark } from '@/components/logo';
import { ServerBanner } from '@/components/layout/AppLayout';

const feedIcon = (action: string) =>
  action.includes('VERIF') || action.includes('APPROV') ? { icon: FileCheck2, tone: 'text-success bg-success/15' } : action.includes('ESCALAT') || action.includes('FLAG') ? { icon: Bot, tone: 'text-warning bg-warning/15' } : { icon: Sparkles, tone: 'text-primary bg-primary/15' };
const secs = (s: number | null) => (s == null ? '—' : s < 60 ? `${s} s` : `${Math.round(s / 60)} min`);

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Aggregate-only, unauthenticated numbers from GET /api/public/summary (no fake fallbacks).
  const pub = useQuery({ queryKey: ['public-summary'], queryFn: () => api<PublicSummary>('/public/summary'), refetchInterval: 60_000 });
  const feed = pub.data?.recent ?? [];

  if (user) return <Navigate to="/" replace />;

  const submit = async (e?: string, p?: string, key = 'form') => {
    setBusy(key);
    setError(null);
    try {
      const u = await login(e ?? email, p ?? password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
      nav(loc.state?.from || '/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ServerBanner />
      <div className="grid flex-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Hero */}
        <div className="relative hidden overflow-hidden bg-navy lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-48 -left-24 size-[480px] rounded-full bg-[#0A5BD6]/40 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="relative">
            <Wordmark light />
          </div>
          <div className="relative max-w-lg">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
              <Zap className="size-3.5 text-primary" /> AI claim agent · Paytm Hackathon 2026
            </div>
            <h1 className="text-[42px] leading-[1.08] font-semibold tracking-[-0.03em] text-white">
              Health claims that <span className="bg-gradient-to-r from-primary to-[#7FDBFF] bg-clip-text text-transparent">settle themselves.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Claim Saathi reads every document, checks it against the policy, raises the right query and calculates the payout. Your team only sees the claims that truly need a human.
            </p>
            <div className="mt-9 space-y-3">
              {pub.isLoading && [0, 1, 2].map((i) => <div key={i} className="h-[66px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.06]" />)}
              {pub.error && <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 text-sm text-white/60">Live agent feed unavailable right now.</div>}
              {feed.map((a, i) => {
                const f = feedIcon(a.action);
                return (
                <div key={a.id} className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm animate-slide-in" style={{ animationDelay: `${i * 120}ms` }}>
                  <div className={`grid size-9 place-items-center rounded-xl ${f.tone}`}>
                    <f.icon className="size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">{titleCase(a.action)}</div>
                    <div className="text-xs text-white/55">{[a.claimNumber, a.confidence != null ? `confidence ${Math.round(a.confidence * 100)}%` : null, ago(a.createdAt)].filter(Boolean).join(' · ')}</div>
                  </div>
                  <span className="text-[11px] font-medium text-white/40">AI</span>
                </div>
                );
              })}
            </div>
          </div>
          <div className="relative flex items-center gap-8 text-white/60">
            {[
              [pub.data?.autoHandledPct != null ? `${pub.data.autoHandledPct}%` : '—', 'claims auto-handled'],
              [secs(pub.data?.medianDocCheckSeconds ?? null), 'median document check'],
              [pub.data?.explainedPct != null ? `${pub.data.explainedPct}%` : '—', 'AI decisions explained'],
            ].map(([a, b]) => (
              <div key={b}>
                <div className="text-xl font-semibold text-white">{a}</div>
                <div className="text-xs">{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-[400px]">
            <div className="mb-10 lg:hidden">
              <Wordmark />
            </div>
            <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-ink">Sign in to the console</h2>
            <p className="mt-2 text-sm text-muted">For Claim Saathi ops and admin teams.</p>

            <form
              className="mt-8 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div>
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" icon={<Mail />} placeholder="you@claimsaathi.demo" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" icon={<Lock />} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              {error && <div className="rounded-xl border border-[#F8CFC8] bg-error-50 px-3.5 py-2.5 text-[13px] text-[#B4321F] animate-fade-in">{error}</div>}
              <Button type="submit" size="lg" className="w-full" loading={busy === 'form'}>
                Sign in <ArrowRight />
              </Button>
            </form>

            <div className="my-7 flex items-center gap-3 text-xs text-subtle">
              <div className="h-px flex-1 bg-line" /> Demo quick login <div className="h-px flex-1 bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'ops', email: 'ops@claimsaathi.demo', title: 'Ops team', sub: 'ops@claimsaathi.demo', icon: BadgeCheck },
                { key: 'admin', email: 'admin@claimsaathi.demo', title: 'Admin', sub: 'admin@claimsaathi.demo', icon: ShieldCheck },
              ].map((q) => (
                <button
                  key={q.key}
                  onClick={() => submit(q.email, 'demo123', q.key)}
                  disabled={!!busy}
                  className="group flex items-center gap-3 rounded-2xl border border-line-strong bg-white p-3.5 text-left shadow-[0_1px_2px_rgb(16_24_40/0.04)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover disabled:opacity-60"
                >
                  <div className="grid size-9 place-items-center rounded-xl bg-primary-50 text-primary-700 transition group-hover:bg-primary group-hover:text-white">
                    <q.icon className="size-[18px]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{busy === q.key ? 'Signing in…' : q.title}</div>
                    <div className="text-xs text-muted">{q.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-8 text-center text-xs leading-relaxed text-subtle">
              Customers track their claims in the Claim Saathi app.
              <br />
              Team Fear Fighters · Dummy data only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
