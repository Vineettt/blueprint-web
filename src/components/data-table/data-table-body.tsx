'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Column, Action } from './types';
import { useCallback } from 'react';

interface DataTableBodyProps<T> {
  data: T[];
  columns: Column<T>[];
  actions: Action<T>[];
  keyExtractor: (row: T) => string;
  isLoading: boolean;
  emptyMessage: string;
}

export function DataTableBody<T>({
  data,
  columns,
  actions,
  keyExtractor,
  isLoading,
  emptyMessage,
}: DataTableBodyProps<T>) {
  const handleActionClick = useCallback((action: Action<T>, row: T) => {
    action.onClick(row);
  }, []);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b bg-muted/50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + actions.length} className="px-4 py-8 text-center">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + actions.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={keyExtractor(row)} className="border-b hover:bg-muted/50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.cell ? col.cell(row) : col.accessor(row)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {actions.map((action) => (
                            <Button
                              key={action.key}
                              variant={action.variant || 'ghost'}
                              size={action.size || 'icon'}
                              onClick={() => handleActionClick(action, row)}
                            >
                              {action.icon}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
