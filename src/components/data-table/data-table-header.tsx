'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DataTableHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showAddButton?: boolean;
  onAddClick?: () => void;
  headerChildren?: ReactNode;
  searchEnabled?: boolean;
  onResetPage: () => void;
}

export function DataTableHeader({
  title,
  searchQuery,
  onSearchChange,
  showAddButton = false,
  onAddClick,
  headerChildren,
  searchEnabled = true,
  onResetPage,
}: DataTableHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
      onResetPage();
    }, 700);

    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange, onResetPage]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2.5">
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-row items-center gap-2.5">
          {headerChildren}
          {showAddButton && onAddClick && (
            <Button variant="outline" size="icon" onClick={onAddClick} className="rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {searchEnabled && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
