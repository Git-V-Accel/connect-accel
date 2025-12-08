import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, hint, required, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export interface InputFieldProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function InputField({ label, error, hint, required, className, ...inputProps }: InputFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Input
        className={cn(error && 'border-destructive', className)}
        aria-invalid={error ? 'true' : undefined}
        aria-required={required}
        {...inputProps}
      />
    </FormField>
  );
}

export interface TextareaFieldProps extends React.ComponentProps<typeof Textarea> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function TextareaField({ label, error, hint, required, className, ...textareaProps }: TextareaFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Textarea
        className={cn(error && 'border-destructive', className)}
        aria-invalid={error ? 'true' : undefined}
        aria-required={required}
        {...textareaProps}
      />
    </FormField>
  );
}

export interface SelectFieldProps extends Omit<React.ComponentProps<typeof Select>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

export function SelectField({
  label,
  error,
  hint,
  required,
  placeholder = 'Select an option',
  options,
  className,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Select {...selectProps}>
        <SelectTrigger className={cn(error && 'border-destructive', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

export interface CheckboxFieldProps extends React.ComponentProps<typeof Checkbox> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function CheckboxField({ label, error, hint, required, className, id, ...checkboxProps }: CheckboxFieldProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <FormField error={error} hint={hint} className="flex flex-row items-start space-x-2 space-y-0">
      <Checkbox
        id={checkboxId}
        className={cn(error && 'border-destructive', className)}
        aria-invalid={error ? 'true' : undefined}
        aria-required={required}
        {...checkboxProps}
      />
      {label && (
        <Label
          htmlFor={checkboxId}
          className={cn(
            'font-normal cursor-pointer',
            required && 'after:content-["*"] after:ml-0.5 after:text-destructive'
          )}
        >
          {label}
        </Label>
      )}
    </FormField>
  );
}

