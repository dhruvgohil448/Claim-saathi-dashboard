import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const base = 'w-full rounded-xl border border-line-strong bg-white text-sm text-ink placeholder:text-subtle shadow-[0_1px_2px_rgb(16_24_40/0.04)] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }>(({ className, icon, ...p }, ref) =>
  icon ? (
    <div className={cn('relative', className)}>
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle [&_svg]:size-4">{icon}</span>
      <input ref={ref} className={cn(base, 'h-10 pr-3 pl-9')} {...p} />
    </div>
  ) : (
    <input ref={ref} className={cn(base, 'h-10 px-3', className)} {...p} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(base, 'min-h-24 resize-y px-3 py-2.5 leading-relaxed', className)} {...p} />
));
Textarea.displayName = 'Textarea';

export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select className={cn(base, 'h-10 w-full cursor-pointer appearance-none pr-9 pl-3')} {...p}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle" />
    </div>
  );
}

export const Label = ({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label className={cn('mb-1.5 block text-[13px] font-medium text-ink', className)} {...p} />;
