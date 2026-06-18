'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

interface DataTablePaginationProps {
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTablePagination({
  pageSize,
  pageIndex,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onPageSizeChange(Number(e.target.value));
      onPageChange(0);
    },
    [onPageSizeChange, onPageChange]
  );

  const handlePreviousPage = useCallback(() => {
    onPageChange(Math.max(0, pageIndex - 1));
  }, [onPageChange, pageIndex]);

  const handleNextPage = useCallback(() => {
    onPageChange(Math.min(totalPages - 1, pageIndex + 1));
  }, [onPageChange, totalPages, pageIndex]);

  return (
    <div className="flex items-center justify-center gap-2">
      <select
        value={pageSize}
        onChange={handlePageSizeChange}
        className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm"
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={100}>100</option>
      </select>

      <Button variant="outline" size="icon" onClick={handlePreviousPage} disabled={pageIndex === 0}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Page {pageIndex + 1} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextPage}
        disabled={pageIndex >= totalPages - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
