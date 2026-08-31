import React from 'react';
import { cn } from '../../utils/cn';

const Label = React.forwardRef(({ className, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[var(--color-text-primary)]",
      className
    )}
    {...props}
  >
    {children}
  </label>
));

Label.displayName = "Label";

export { Label };
