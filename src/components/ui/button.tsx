import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white shadow-[0_1px_2px_rgb(0_186_242/0.3),inset_0_1px_0_rgb(255_255_255/0.15)] hover:bg-primary-600',
        navy: 'bg-navy text-white shadow-sm hover:bg-navy-800',
        success: 'bg-success text-white shadow-sm hover:brightness-95',
        danger: 'bg-error text-white shadow-sm hover:brightness-95',
        outline: 'border border-line-strong bg-white text-ink shadow-[0_1px_2px_rgb(16_24_40/0.04)] hover:bg-canvas hover:border-[#C7D2DF]',
        ghost: 'text-muted hover:bg-[#EEF3F8] hover:text-ink',
        soft: 'bg-primary-50 text-[#0077A8] hover:bg-primary-100',
        'soft-danger': 'bg-error-50 text-[#C23B28] hover:bg-[#FBDDD8]',
      },
      size: { sm: 'h-8 px-3 text-[13px] rounded-lg', md: 'h-10 px-4', lg: 'h-11 px-5 text-[15px]', icon: 'size-9 rounded-xl', 'icon-sm': 'size-8 rounded-lg' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, loading, children, disabled, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
    {loading && <Loader2 className="animate-spin" />}
    {children}
  </button>
));
Button.displayName = 'Button';
