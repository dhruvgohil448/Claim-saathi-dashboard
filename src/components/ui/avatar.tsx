import { cn } from '@/lib/utils';
import { initials } from '@/lib/format';

const palette = ['from-[#00BAF2] to-[#0086B3]', 'from-[#7C5CFC] to-[#5B3FD9]', 'from-[#0FA37F] to-[#08805F]', 'from-[#F5A524] to-[#E08A00]', 'from-[#E85D4A] to-[#C23B28]', 'from-[#002E6E] to-[#0A3A7D]'];
const pick = (s: string) => palette[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];

export function Avatar({ name, className }: { name?: string; className?: string }) {
  return (
    <div className={cn('grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white ring-2 ring-white', pick(name || '?'), className)}>
      {initials(name)}
    </div>
  );
}
