"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "./utils";

export interface SearchableSelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SearchableSelectProps<T = string> {
  options: SearchableSelectOption<T>[];
  value?: T;
  onValueChange?: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  width?: number | "auto";
  maxHeight?: number;
  getDisplayValue?: (value: T | undefined) => string;
}

function SearchableSelect<T = string>({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  width = "auto",
  maxHeight = 300,
  getDisplayValue,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>(
    typeof width === "number" ? width : undefined
  );

  React.useEffect(() => {
    if (open && width === "auto" && triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    } else if (typeof width === "number") {
      setPopoverWidth(width);
    }
  }, [open, width]);

  const selectedOption = options.find((option) => option.value === value);

  const displayValue = React.useMemo(() => {
    if (getDisplayValue) {
      return getDisplayValue(value);
    }
    return selectedOption?.label || placeholder;
  }, [selectedOption, value, placeholder, getDisplayValue]);

  const handleSelect = (selectedValue: T) => {
    const option = options.find((opt) => opt.value === selectedValue);
    if (option && !option.disabled) {
      onValueChange?.(selectedValue);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedOption && "text-muted-foreground",
            triggerClassName
          )}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0", contentClassName)}
        align={align}
        side={side}
        sideOffset={sideOffset}
        style={popoverWidth ? { width: `${popoverWidth}px` } : undefined}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList style={{ maxHeight: `${maxHeight}px` }}>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.value;
                const isDisabled = option.disabled || false;

                return (
                  <CommandItem
                    key={String(option.value)}
                    value={option.label}
                    disabled={isDisabled}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      "cursor-pointer",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { SearchableSelect };

