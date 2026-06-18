'use client';

import * as React from 'react';
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'group/toggle inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
  {
    variants: {
      variant: {
        default:
          'bg-transparent hover:bg-muted data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
      },
      size: {
        default: 'h-9 w-9',
        sm: 'h-8 w-8',
        lg: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
