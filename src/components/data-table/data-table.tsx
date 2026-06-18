'use client';

import React, {
  ReactNode,
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { Endpoint } from '@/constants/route';
import { useDataTable } from '@/hooks/useDataTable';
import { DataTableHeader } from './data-table-header';
import { DataTableBody } from './data-table-body';
import { DataTablePagination } from './data-table-pagination';
import { Column, Action } from './types';

interface DataTableContextValue<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refetch: () => void;
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  actions?: Action<T>[];
  emptyMessage: string;
}

const DataTableContext = createContext<DataTableContextValue<unknown> | null>(null);

function useDataTableContext<T>(): DataTableContextValue<T> {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error('DataTable subcomponents must be used within DataTable.Root');
  }
  return context as DataTableContextValue<T>;
}

interface DataTableRootProps<T> {
  endpoint: Endpoint;
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  children: ReactNode;
  initialPageSize?: number;
  roleFilter?: string;
  actions?: Action<T>[];
  emptyMessage?: string;
}

interface DataTableRef {
  refetch: () => void;
}

const DataTableRootInner = forwardRef(function DataTableRootInner<T>(
  {
    endpoint,
    columns,
    keyExtractor,
    children,
    initialPageSize = 10,
    roleFilter,
    actions,
    emptyMessage = 'No data found',
  }: DataTableRootProps<T>,
  ref: React.Ref<DataTableRef>
) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, total, isLoading, pageIndex, pageSize, setPageIndex, setPageSize, refetch } =
    useDataTable<T>({
      endpoint,
      initialPageSize,
      roleFilter,
      searchQuery,
    });

  const refetchRef = useRef(refetch);

  const stableRefetch = useCallback(() => {
    refetchRef.current();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      refetch: stableRefetch,
    }),
    [stableRefetch]
  );

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  const contextValue: DataTableContextValue<T> = {
    data,
    total,
    isLoading,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    searchQuery,
    setSearchQuery,
    refetch: stableRefetch,
    columns,
    keyExtractor,
    actions,
    emptyMessage,
  };

  return (
    <DataTableContext.Provider value={contextValue as DataTableContextValue<unknown>}>
      <div className="p-4 flex flex-col gap-2.5">{children}</div>
    </DataTableContext.Provider>
  );
}) as <T>(props: DataTableRootProps<T> & { ref?: React.Ref<DataTableRef> }) => React.ReactElement;

interface DataTableHeaderProps {
  title: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  children?: ReactNode;
  searchEnabled?: boolean;
}

function DataTableHeaderComponent({
  title,
  showAddButton = false,
  onAddClick,
  children,
  searchEnabled = true,
}: DataTableHeaderProps) {
  const { searchQuery, setSearchQuery, setPageIndex } = useDataTableContext();

  return (
    <DataTableHeader
      title={title}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      showAddButton={showAddButton}
      onAddClick={onAddClick}
      headerChildren={children}
      searchEnabled={searchEnabled}
      onResetPage={() => setPageIndex(0)}
    />
  );
}

function DataTableBodyComponent<T>() {
  const { data, columns, actions, keyExtractor, isLoading, emptyMessage } =
    useDataTableContext<T>();

  return (
    <DataTableBody
      data={data}
      columns={columns}
      actions={actions || []}
      keyExtractor={keyExtractor}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
    />
  );
}

function DataTablePaginationComponent() {
  const { pageSize, pageIndex, total, setPageIndex, setPageSize } = useDataTableContext();
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <DataTablePagination
      pageSize={pageSize}
      pageIndex={pageIndex}
      totalPages={totalPages}
      onPageChange={setPageIndex}
      onPageSizeChange={setPageSize}
    />
  );
}

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  endpoint: Endpoint;
  keyExtractor: (row: T) => string;
  actions?: Action<T>[];
  showAddButton?: boolean;
  onAddClick?: () => void;
  headerChildren?: ReactNode;
  searchEnabled?: boolean;
  initialPageSize?: number;
  emptyMessage?: string;
  roleFilter?: string;
}

const DataTableLegacy = forwardRef(function DataTableLegacy<T>(
  {
    title,
    columns,
    endpoint,
    keyExtractor,
    actions = [],
    showAddButton = false,
    onAddClick,
    headerChildren,
    searchEnabled = true,
    initialPageSize = 10,
    emptyMessage = 'No data found',
    roleFilter,
  }: DataTableProps<T>,
  ref: React.Ref<DataTableRef>
) {
  return (
    <DataTableRootInner
      ref={ref}
      endpoint={endpoint}
      columns={columns}
      keyExtractor={keyExtractor}
      initialPageSize={initialPageSize}
      roleFilter={roleFilter}
      actions={actions}
      emptyMessage={emptyMessage}
    >
      <DataTableHeaderComponent
        title={title}
        showAddButton={showAddButton}
        onAddClick={onAddClick}
        searchEnabled={searchEnabled}
      >
        {headerChildren}
      </DataTableHeaderComponent>
      <DataTableBodyComponent />
      <DataTablePaginationComponent />
    </DataTableRootInner>
  );
}) as <T>(props: DataTableProps<T> & { ref?: React.Ref<DataTableRef> }) => React.ReactElement;

export const DataTable = Object.assign(DataTableLegacy, {
  Root: DataTableRootInner,
  Header: DataTableHeaderComponent,
  Body: DataTableBodyComponent,
  Pagination: DataTablePaginationComponent,
});

export { DataTableRootInner as DataTableRoot };
export { DataTableHeaderComponent as DataTableHeaderWrapper };
export { DataTableBodyComponent as DataTableBodyWrapper };
export { DataTablePaginationComponent as DataTablePaginationWrapper };
