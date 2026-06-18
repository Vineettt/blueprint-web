'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Endpoint } from '@/constants/route';
import { apiFetch, getErrorMessage } from '@/utils/apiUtils';

interface UseDataTableOptions {
  endpoint: Endpoint;
  initialPageSize?: number;
  roleFilter?: string;
  searchQuery?: string;
}

interface UseDataTableResult<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  error: string | null;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
}

export function useDataTable<T>({
  endpoint,
  initialPageSize = 10,
  roleFilter,
  searchQuery = '',
}: UseDataTableOptions): UseDataTableResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const isMounted = useRef(true);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      if (isMounted.current) {
        setIsLoading(true);
      }
      try {
        interface DataTableRequest {
          limit: number;
          offset: number;
          search: string;
          role?: string;
        }
        const body: DataTableRequest = {
          limit: pageSize,
          offset: pageIndex * pageSize,
          search: searchQuery,
        };
        if (roleFilter) {
          body.role = roleFilter;
        }
        interface DataTableResponse {
          data: {
            payload?: T[];
            roles?: T[];
            routes?: T[];
            total?: number;
            length?: number;
          };
        }
        const response = await apiFetch<DataTableResponse>(endpoint, {
          method: 'POST',
          body: JSON.stringify(body),
          signal,
        });
        if (isMounted.current) {
          const responseData = response?.data;
          const rows = responseData?.payload ?? responseData?.roles ?? responseData?.routes ?? [];
          const total = responseData?.total ?? responseData?.length ?? rows.length;

          setData(rows);
          setTotal(total);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        if (isMounted.current) {
          setError(getErrorMessage(error) || 'Failed to fetch data');
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [endpoint, pageIndex, pageSize, searchQuery, roleFilter]
  );

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => fetchData(controller.signal), 0);
    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    total,
    isLoading,
    error,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    refetch,
  };
}
