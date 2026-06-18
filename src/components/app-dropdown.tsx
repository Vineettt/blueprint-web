'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type DropdownAction = {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
  visible?: () => boolean;
};

type AppDropdownProps = {
  trigger: ReactNode;
  items: DropdownAction[];
  align?: 'start' | 'center' | 'end';
  className?: string;
};

export function AppDropdown({
  trigger,
  items,
  align = 'end',
  className = 'w-56',
}: AppDropdownProps) {
  const visibleItems = items.filter((item) => (item.visible ? item.visible() : true));

  if (visibleItems.length === 0) return null;

  const handleAction = (item: DropdownAction) => {
    if (item.disabled) return;

    requestAnimationFrame(() => {
      if (item.onClick) {
        item.onClick();
        return;
      }

      if (item.href) {
        window.location.href = item.href;
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger as React.ReactElement}></DropdownMenuTrigger>

      <DropdownMenuContent align={align} className={className}>
        {visibleItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={`${item.label}-${index}`}>
              {item.separatorBefore && <DropdownMenuSeparator />}

              <DropdownMenuItem
                disabled={item.disabled}
                className={item.destructive ? 'text-destructive focus:text-destructive' : undefined}
                onClick={() => handleAction(item)}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {item.label}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
