import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-bold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[#E63946] text-white hover:bg-[#d62839] shadow-xs border border-transparent',
        secondary: 'bg-[var(--color-secondary-light)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary-medium)] hover:text-white border border-transparent',
        outline: 'border border-slate-300 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 text-slate-700 shadow-2xs',
        ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-600 border border-transparent',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-transparent',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs border border-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, isLoading, children, icon: Icon, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
      {!isLoading && Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
      <span>{children}</span>
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
