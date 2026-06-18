'use client';

import { useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GlobalLoading } from '@/components/ui/global-loading';
import { DataTable, Column, Action } from '@/components/data-table';
import { Endpoint } from '@/constants/route';
import { Pencil } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';

const UpdateRouteDialog = dynamic(
  () =>
    import('@/components/dialogs/route/update').then((mod) => ({ default: mod.UpdateRouteDialog })),
  {
    loading: () => <GlobalLoading message="Loading dialog..." />,
    ssr: false,
  }
);

interface Route {
  id: string;
  endpoint: string;
  method: string;
  access: string;
  status: number;
}

function MethodBadge({ method }: { method: string }) {
  const base = 'px-2 py-1 rounded text-xs font-medium border dark:border-opacity-30';

  const styles: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
    POST: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
    PUT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400',
    PATCH: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400',
    DELETE: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
  };

  const key = method?.trim().toUpperCase();

  return <span className={`${base} ${styles[key] ?? styles.GET}`}>{key}</span>;
}

function RouteTypeBadge({ type }: { type: string }) {
  const base = 'px-2 py-1 rounded text-xs font-medium border dark:border-opacity-30';

  const styles: Record<string, string> = {
    public: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
    private: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
  };

  const key = type?.toLowerCase();

  return <span className={`${base} ${styles[key] ?? styles.public}`}>{type}</span>;
}

export default function Routes() {
  const tableRef = useRef<{ refetch: () => void }>(null);

  const editDialog = useDialog<Route>({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const handleEditClick = useCallback(
    (route: Route) => {
      editDialog.open(route);
    },
    [editDialog]
  );

  const columns: Column<Route>[] = useMemo(
    () => [
      {
        key: 'access',
        header: 'Access',
        accessor: (m) => m.access,
        cell: (m) => <RouteTypeBadge type={m.access} />,
      },
      { key: 'endpoint', header: 'Endpoint', accessor: (r: Route) => r.endpoint },
      {
        key: 'method',
        header: 'Method',
        accessor: (m) => m.method,
        cell: (m) => <MethodBadge method={m.method} />,
      },
    ],
    []
  );

  const actions: Action<Route>[] = useMemo(
    () => [
      {
        key: 'edit',
        icon: <Pencil className="h-4 w-4" />,
        onClick: handleEditClick,
        variant: 'ghost',
        size: 'icon',
      },
    ],
    [handleEditClick]
  );

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTable<Route>
        title="Routes"
        endpoint={Endpoint.ROUTES}
        columns={columns}
        keyExtractor={(r: Route) => r.id}
        actions={actions}
        emptyMessage="No routes found"
        ref={tableRef}
      />
      <UpdateRouteDialog
        open={editDialog.isOpen}
        onOpenChange={(open) => !open && editDialog.close()}
        route={editDialog.selectedItem}
        onSuccess={editDialog.onSuccess}
      />
    </div>
  );
}
