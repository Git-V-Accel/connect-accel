import React, { useState, useEffect } from 'react';
import { PasswordInput, PasswordInputProps } from './PasswordInput';
import { FormField } from './FormField';
import { cn } from '../ui/utils';
import { Check, X } from 'lucide-react';

export interface PasswordFieldProps extends PasswordInputProps {
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    showValidation?: boolean;
    onValidationChange?: (isValid: boolean) => void;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
    ({ label, error, hint, required, className, showValidation = true, value, onChange, onValidationChange, ...props }, ref) => {
        const [touched, setTouched] = useState(false);

        const password = typeof value === 'string' ? value : '';

        // Validation rules
        const rules = [
            { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
            { label: 'At least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
            { label: 'At least one lowercase letter', test: (p: string) => /[a-z]/.test(p) },
            { label: 'At least one number', test: (p: string) => /\d/.test(p) },
            { label: 'At least one special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
            { label: 'No spaces allowed', test: (p: string) => !/\s/.test(p) },
        ];

        const isValid = rules.every(rule => rule.test(password));

        useEffect(() => {
            onValidationChange?.(isValid);
        }, [isValid, onValidationChange]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setTouched(true);
            onChange?.(e);
        };

        return (
            <FormField label={label} error={error} hint={hint} required={required} className={className}>
                <PasswordInput
                    ref={ref}
                    value={value}
                    onChange={handleChange}
                    onBlur={() => setTouched(true)}
                    className={cn(error && 'border-destructive')}
                    {...props}
                />

                {showValidation && (password.length > 0 || touched) && (
                    <div className="mt-3 space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Password Requirements:</p>
                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {rules.map((rule, index) => {
                                const passed = rule.test(password);
                                return (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                        {passed ? (
                                            <div className="flex size-2 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                                <Check className="size-2 text-green-600 dark:text-green-400" />
                                            </div>
                                        ) : (
                                            <div className="flex size-2 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                                                <X className="size-2 text-gray-500 dark:text-gray-400" />
                                            </div>
                                        )}
                                        <span className={cn(
                                            "text-[11px] transition-colors",
                                            passed ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                                        )}>
                                            {rule.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </FormField>
        );
    }
);

PasswordField.displayName = 'PasswordField';
