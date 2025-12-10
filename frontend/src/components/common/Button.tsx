import React from 'react';
import { Button as BaseButton, buttonVariants } from '../ui/button';
import { cn } from '../ui/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ComponentProps<typeof BaseButton> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, loading, leftIcon, rightIcon, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        className={cn(fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </BaseButton>
    );
  }
);

Button.displayName = 'Button';

// Export button variants for use in other components
export { buttonVariants };

