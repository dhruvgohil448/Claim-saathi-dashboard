import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <defs>
        <linearGradient id="cs-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00BAF2" />
          <stop offset="1" stopColor="#0072C6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#cs-g)" />
      <path d="M16 6.5 8.5 9.4v6.1c0 4.7 3.2 8.6 7.5 10 4.3-1.4 7.5-5.3 7.5-10V9.4L16 6.5Z" fill="#fff" fillOpacity=".18" />
      <path d="M16 7.6 9.6 10.1v5.4c0 4.1 2.7 7.5 6.4 8.8 3.7-1.3 6.4-4.7 6.4-8.8v-5.4L16 7.6Z" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <path d="m12.8 15.9 2.3 2.3 4.4-4.6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ collapsed, light }: { collapsed?: boolean; light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <div className="leading-none">
          <div className={cn('text-[17px] font-bold tracking-[-0.02em]', light ? 'text-white' : 'text-navy')}>
            Claim<span className="text-primary">Saathi</span>
          </div>
          <div className={cn('mt-1 text-[10px] font-medium tracking-[0.08em] uppercase', light ? 'text-white/60' : 'text-subtle')}>Ops Console</div>
        </div>
      )}
    </div>
  );
}
