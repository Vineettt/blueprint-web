'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { DataTable, Column, Action } from '@/components/data-table';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { Endpoint } from '@/constants/route';
import { apiFetch } from '@/utils/apiUtils';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDialog } from '@/hooks/useDialog';
import { useConfirmedMutation } from '@/hooks/useConfirmedMutation';
import { logger } from '@/utils/logger';
import dynamic from 'next/dynamic';

const RoleRouteMappingDialog = dynamic(
  () =>
    import('@/components/dialogs/role-route-mapping/modify').then((mod) => ({
      default: mod.RoleRouteMappingDialog,
    })),
  { ssr: false }
);

interface Role {
  id: string;
  name: string;
}

interface RoleRouteMapping {
  id: string;
  name: string;
  roleId: string;
  endpoint: string;
  method: string;
  route_id: string;
  access: string;
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

export default function RoleRouteMapping() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const tableRef = useRef<{ refetch: () => void }>(null);

  const dialog = useDialog<Role>({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const {
    mutate: deleteMapping,
    confirmOpen,
    confirmMethod,
    onConfirm,
    onCancel,
    isLoading: isDeleting,
  } = useConfirmedMutation<{ message?: string }>({
    onSuccess: (response) => {
      toast.success(response?.message || 'Mapping deleted successfully');
      tableRef.current?.refetch();
    },
    onError: () => {
      toast.error('Failed to delete mapping');
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchRoles = async () => {
      try {
        const response = await apiFetch<{
          data?: { payload?: Role[] };
        }>(Endpoint.ROLES, {
          method: 'GET',
          signal: controller.signal,
        });

        const rolesData = response?.data?.payload ?? [];

        setRoles(rolesData);

        if (rolesData.length > 0) {
          setSelectedRole(rolesData[0].id);
        }
      } catch (error: unknown) {
        if ((error as { name?: string })?.name === 'AbortError') return;

        logger.error('Failed to fetch roles:', error);
        toast.error('Failed to fetch roles');
      }
    };

    fetchRoles();

    return () => controller.abort();
  }, []);

  const handleDeleteMapping = useCallback(
    (id: string) => {
      deleteMapping(Endpoint.ROLE_ROUTE_MAPPING, 'DELETE', {
        mapping: [{ mapping_id: id }],
      });
    },
    [deleteMapping]
  );

  const handleAddClick = useCallback(() => {
    const currentRole = roles.find((r) => r.id === selectedRole) ?? null;

    dialog.open(currentRole ?? undefined);
  }, [dialog, roles, selectedRole]);

  const columns: Column<RoleRouteMapping>[] = useMemo(
    () => [
      {
        key: 'access',
        header: 'Access',
        accessor: (m) => m.access,
        cell: (m) => <RouteTypeBadge type={m.access} />,
      },
      { key: 'endpoint', header: 'Endpoint', accessor: (m) => m.endpoint },
      {
        key: 'method',
        header: 'Method',
        accessor: (m) => m.method,
        cell: (m) => <MethodBadge method={m.method} />,
      },
    ],
    []
  );

  const actions: Action<RoleRouteMapping>[] = useMemo(
    () => [
      {
        key: 'delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (m) => handleDeleteMapping(m.id),
        variant: 'ghost',
        size: 'icon',
      },
    ],
    [handleDeleteMapping]
  );

  const roleSelect = (
    <select
      value={selectedRole ?? ''}
      onChange={(e) => setSelectedRole(e.target.value)}
      disabled={roles.length === 0 || isDeleting}
      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
    >
      {roles.length === 0 ? (
        <option value="">No roles available</option>
      ) : (
        roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))
      )}
    </select>
  );

  return (
    <div className="p-4 flex flex-col gap-2.5">
      {selectedRole && (
        <DataTable<RoleRouteMapping>
          title="Role Route Mapping"
          endpoint={Endpoint.ROLE_ROUTE_MAPPINGS}
          columns={columns}
          keyExtractor={(m) => m.id}
          headerChildren={roleSelect}
          actions={actions}
          roleFilter={selectedRole}
          emptyMessage="No mappings found"
          ref={tableRef}
          showAddButton={roles.length > 0}
          onAddClick={handleAddClick}
        />
      )}

      {dialog.isOpen && dialog.selectedItem && (
        <RoleRouteMappingDialog
          open={dialog.isOpen}
          onOpenChange={(open) => !open && dialog.close()}
          onSuccess={dialog.onSuccess}
          role={dialog.selectedItem}
        />
      )}

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={(o) => !o && onCancel()}
        onConfirm={onConfirm}
        method={confirmMethod}
        isLoading={isDeleting}
      />
    </div>
  );
}
