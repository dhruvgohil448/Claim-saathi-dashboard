import * as D from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({ title, description, children, className, footer }: { title: ReactNode; description?: ReactNode; children?: ReactNode; className?: string; footer?: ReactNode }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-[#0B1B33]/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
      <D.Content className={cn('fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-line bg-white shadow-pop outline-none data-[state=open]:animate-fade-in', className)}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <D.Title className="truncate text-base font-semibold text-ink">{title}</D.Title>
            {description ? <D.Description className="mt-0.5 text-[13px] text-muted">{description}</D.Description> : <D.Description className="sr-only">Dialog</D.Description>}
          </div>
          <D.Close className="-mr-1 rounded-lg p-1.5 text-subtle transition hover:bg-canvas hover:text-ink">
            <X className="size-4" />
          </D.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line bg-[#FAFCFE] px-6 py-3.5 rounded-b-2xl">{footer}</div>}
      </D.Content>
    </D.Portal>
  );
}

export function SheetContent({ title, description, children, className }: { title: ReactNode; description?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-[#0B1B33]/30 backdrop-blur-[1px] data-[state=open]:animate-fade-in" />
      <D.Content className={cn('fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-line bg-white shadow-pop outline-none data-[state=open]:animate-slide-in', className)}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <D.Title className="text-lg font-semibold text-ink">{title}</D.Title>
            {description ? <D.Description className="mt-0.5 text-[13px] text-muted">{description}</D.Description> : <D.Description className="sr-only">Details</D.Description>}
          </div>
          <D.Close className="rounded-lg p-1.5 text-subtle transition hover:bg-canvas hover:text-ink">
            <X className="size-4" />
          </D.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
      </D.Content>
    </D.Portal>
  );
}
