import * as T from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export const TooltipProvider = T.Provider;
export function Tooltip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <T.Root delayDuration={150}>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content side={side} sideOffset={8} className="z-50 max-w-xs rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-white shadow-pop data-[state=delayed-open]:animate-fade-in">
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
