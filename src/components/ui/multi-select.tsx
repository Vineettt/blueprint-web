'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  disabled = false,
  label,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = React.useCallback(
    (value: string) => {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    },
    [selected, onChange]
  );

  const handleRemove = React.useCallback(
    (value: string) => {
      onChange(selected.filter((v) => v !== value));
    },
    [selected, onChange]
  );

  const handleDropdownClick = React.useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleBadgeRemove = React.useCallback(
    (label: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const value = options.find((opt) => opt.label === label)?.value;
      if (value) handleRemove(value);
    },
    [options, handleRemove]
  );

  const selectedLabels = selected
    .map((value) => options.find((opt) => opt.value === value)?.label)
    .filter(Boolean) as string[];

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>}
      <div
        onClick={handleDropdownClick}
        className={cn(
          'flex min-h-[40px] w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-input/30 dark:hover:bg-input/50',
          isOpen && 'border-ring ring-3 ring-ring/50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {selectedLabels.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          <>
            {selectedLabels.map((label) => (
              <Badge key={label} variant="secondary" className="flex items-center gap-1 pr-1">
                {label}
                <button
                  type="button"
                  onClick={(e) => handleBadgeRemove(label, e)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </>
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-input bg-popover shadow-md ring-1 ring-foreground/10">
          <div className="max-h-60 overflow-auto p-1">
            {options.length === 0 ? (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className={cn(
                      'relative flex cursor-default items-center rounded-md px-2 py-1.5 text-sm outline-none select-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      isSelected && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <span className="flex-1">{option.label}</span>
                    {isSelected && (
                      <svg
                        className="ml-2 h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
