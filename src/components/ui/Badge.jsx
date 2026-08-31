import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--color-primary)] text-white",
        secondary: "border-transparent bg-[var(--color-lavender)] text-[var(--color-navy)]",
        destructive: "border-transparent bg-[var(--color-error)] text-white",
        outline: "text-[var(--color-text-primary)]",
        success: "border-transparent bg-[var(--color-success)] text-white",
        warning: "border-transparent bg-[var(--color-warning)] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
