import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Bot, FileCheck2, Lock, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Wordmark } from '@/components/logo';
import { ServerBanner } from '@/components/layout/AppLayout';

const feed = [
  { icon: FileCheck2, tone: 'text-success bg-success/15', t: 'Discharge summary verified', d: 'CLM-1009 · confidence 94%' },
  { icon: Sparkles, tone: 'text-primary bg-primary/15', t: 'Settlement calculated: ₹43,560', d: 'CLM-1001 · 10% co-pay applied' },
  { icon: Bot, tone: 'text-warning bg-warning/15', t: 'Escalated to a specialist', d: 'CLM-1003 · amount above ₹1,00,000' },
];

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
              {feed.map((f, i) => (
                <div key={i} className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm animate-slide-in" style={{ animationDelay: `${i * 120}ms` }}>
                  <div className={`grid size-9 place-items-center rounded-xl ${f.tone}`}>
                    <f.icon className="size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">{f.t}</div>
                    <div className="text-xs text-white/55">{f.d}</div>
                  </div>
                  <span className="text-[11px] font-medium text-white/40">AI</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex items-center gap-8 text-white/60">
            {[
              ['78%', 'claims auto-handled'],
              ['< 2 min', 'document checks'],
              ['100%', 'decisions explained'],
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
                { key: 'ops', email: 'ops@claimsaathi.demo', title: 'Ops team', sub: 'Ishita Rao', icon: BadgeCheck },
                { key: 'admin', email: 'admin@claimsaathi.demo', title: 'Admin', sub: 'Kabir Shah', icon: ShieldCheck },
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
