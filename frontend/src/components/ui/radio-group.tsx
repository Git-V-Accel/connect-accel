"use client";

import * as React from "react";
import { RadioGroup as MUIRadioGroup, Radio as MUIRadio } from "@mui/material";

import { cn } from "./utils";

type MUIRadioGroupProps = React.ComponentProps<typeof MUIRadioGroup> & {
  onValueChange?: (value: string) => void;
};

function RadioGroup({
  className,
  onValueChange,
  onChange,
  ...props
}: MUIRadioGroupProps) {
  return (
    <MUIRadioGroup
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      onChange={(event, value) => {
        onChange?.(event, value);
        if (onValueChange) onValueChange(String(value));
      }}
      {...props}
    />
  );
}

type MUIRadioProps = React.ComponentProps<typeof MUIRadio>;

function RadioGroupItem({
  className,
  id,
  inputProps,
  ...props
}: MUIRadioProps & { id?: string }) {
  return (
    <MUIRadio
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      inputProps={{ id, ...(inputProps || {}) }}
      {...props}
    />
  );
}

export { RadioGroup, RadioGroupItem };
