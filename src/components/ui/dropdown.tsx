import * as M from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Dropdown = M.Root;
export const DropdownTrigger = M.Trigger;

export function DropdownContent({ children, className, align = 'end' }: { children: ReactNode; className?: string; align?: 'start' | 'end' | 'center' }) {
  return (
    <M.Portal>
      <M.Content align={align} sideOffset={8} className={cn('z-50 min-w-52 rounded-xl border border-line bg-white p-1.5 shadow-pop data-[state=open]:animate-fade-in', className)}>
        {children}
      </M.Content>
    </M.Portal>
  );
}

export const DropdownItem = ({ className, ...p }: M.DropdownMenuItemProps) => (
  <M.Item className={cn('flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink outline-none select-none data-[highlighted]:bg-canvas [&_svg]:size-4 [&_svg]:text-subtle', className)} {...p} />
);
export const DropdownSeparator = () => <M.Separator className="my-1.5 h-px bg-line" />;
export const DropdownLabel = ({ className, ...p }: M.DropdownMenuLabelProps) => <M.Label className={cn('px-2.5 py-1.5', className)} {...p} />;
