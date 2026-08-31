import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-navy)] shadow-sm',
        secondary: 'bg-[var(--color-lavender)] text-[var(--color-navy)] hover:bg-gray-300',
        outline: 'border border-[var(--color-border)] bg-transparent hover:bg-gray-100 text-[var(--color-text-primary)]',
        ghost: 'hover:bg-gray-100 hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)]',
        danger: 'bg-[var(--color-error)] text-white hover:bg-red-700 shadow-sm',
        success: 'bg-[var(--color-success)] text-white hover:bg-green-700 shadow-sm',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8',
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
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
