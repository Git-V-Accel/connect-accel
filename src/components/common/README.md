# Common Reusable Components

This directory contains enhanced, reusable UI components built on top of the base UI components. These components provide common patterns, better TypeScript support, and consistent styling across the application.

## Components

### Button

Enhanced button component with loading states and icon support.

```tsx
import { Button } from '@/components/common';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="outline" size="lg">Outline Button</Button>

// With loading state
<Button loading={isLoading}>Submit</Button>

// With icons
<Button leftIcon={<PlusIcon />}>Add Item</Button>
<Button rightIcon={<ArrowRightIcon />}>Next</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

**Props:**
- `loading?: boolean` - Shows loading spinner and disables button
- `leftIcon?: ReactNode` - Icon displayed on the left
- `rightIcon?: ReactNode` - Icon displayed on the right
- `fullWidth?: boolean` - Makes button full width
- All standard Button props (variant, size, disabled, etc.)

### FormField

Wrapper component for form fields with label, error, and hint support.

```tsx
import { FormField } from '@/components/common';

<FormField label="Email" error="Invalid email" required>
  <Input type="email" />
</FormField>
```

**Props:**
- `label?: string` - Field label
- `error?: string` - Error message to display
- `hint?: string` - Helper text
- `required?: boolean` - Shows required indicator
- `children` - Form input component

### InputField

Complete input field with label, error handling, and validation.

```tsx
import { InputField } from '@/components/common';

<InputField
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  hint="We'll never share your email"
  required
/>
```

**Props:**
- All `InputFieldProps` extends `Input` props
- `label?: string` - Field label
- `error?: string` - Error message
- `hint?: string` - Helper text
- `required?: boolean` - Required indicator

### TextareaField

Textarea field with label, error handling, and validation.

```tsx
import { TextareaField } from '@/components/common';

<TextareaField
  label="Description"
  placeholder="Enter description"
  rows={5}
  error={errors.description}
  required
/>
```

**Props:**
- All `TextareaFieldProps` extends `Textarea` props
- `label?: string` - Field label
- `error?: string` - Error message
- `hint?: string` - Helper text
- `required?: boolean` - Required indicator

### SelectField

Select dropdown with label, error handling, and options.

```tsx
import { SelectField } from '@/components/common';

<SelectField
  label="Category"
  placeholder="Select a category"
  options={[
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile Development' },
  ]}
  error={errors.category}
  required
/>
```

**Props:**
- `label?: string` - Field label
- `error?: string` - Error message
- `hint?: string` - Helper text
- `required?: boolean` - Required indicator
- `placeholder?: string` - Placeholder text
- `options: Array<{ value: string; label: string }>` - Select options
- All standard Select props

### CheckboxField

Checkbox with label, error handling, and validation.

```tsx
import { CheckboxField } from '@/components/common';

<CheckboxField
  label="I agree to the terms and conditions"
  checked={agreed}
  onCheckedChange={setAgreed}
  error={errors.agreement}
  required
/>
```

**Props:**
- All `CheckboxFieldProps` extends `Checkbox` props
- `label?: string` - Checkbox label
- `error?: string` - Error message
- `hint?: string` - Helper text
- `required?: boolean` - Required indicator

## Base UI Components

You can also import base UI components directly from `@/components/ui`:

```tsx
import { Button, Input, Select, Checkbox, Label, Textarea } from '@/components/ui';
```

Or use the centralized export:

```tsx
import { Button, Input, Select, Checkbox } from '@/components/ui';
```

## Usage Examples

### Complete Form Example

```tsx
import { InputField, SelectField, CheckboxField, Button } from '@/components/common';
import { useState } from 'react';

function MyForm() {
  const [formData, setFormData] = useState({
    email: '',
    category: '',
    agreed: false,
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    // Validation logic
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        required
      />

      <SelectField
        label="Category"
        value={formData.category}
        onValueChange={(value) => setFormData({ ...formData, category: value })}
        options={[
          { value: 'web', label: 'Web Development' },
          { value: 'mobile', label: 'Mobile Development' },
        ]}
        error={errors.category}
        required
      />

      <CheckboxField
        label="I agree to the terms"
        checked={formData.agreed}
        onCheckedChange={(checked) => setFormData({ ...formData, agreed: !!checked })}
        error={errors.agreed}
        required
      />

      <Button type="submit" loading={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

## Best Practices

1. **Always use FormField components** for form inputs to ensure consistent styling and error handling
2. **Use the enhanced Button** component for loading states and icons
3. **Provide proper labels** for accessibility
4. **Handle errors** properly by passing error messages to components
5. **Use required prop** to indicate mandatory fields
6. **Use TypeScript** for type safety - all components are fully typed

