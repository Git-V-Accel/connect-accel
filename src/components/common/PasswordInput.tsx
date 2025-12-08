import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../ui/utils';

export interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(showToggle && 'pr-10', className)}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

