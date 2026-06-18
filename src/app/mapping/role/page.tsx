'use client';

import { useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GlobalLoading } from '@/components/ui/global-loading';
import { DataTable, Column, Action } from '@/components/data-table';
import { Endpoint } from '@/constants/route';
import { Pencil, Trash2 } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';
import { toast } from 'sonner';
import { useConfirmedMutation } from '@/hooks/useConfirmedMutation';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';

const RoleDialog = dynamic(
  () =>
    import('@/components/dialogs/role/add-update').then((mod) => ({
      default: mod.RoleDialog,
    })),
  {
    loading: () => <GlobalLoading message="Loading dialog..." />,
    ssr: false,
  }
);

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function Roles() {
  const tableRef = useRef<{ refetch: () => void }>(null);

  const {
    mutate: deleteRole,
    confirmOpen,
    confirmMethod,
    onConfirm,
    onCancel,
    isLoading: isDeleting,
  } = useConfirmedMutation<{ message?: string }>({
    onSuccess: (response) => {
      toast.success(response?.message || 'Role  deleted successfully');
      tableRef.current?.refetch();
    },
    onError: (err) => {
      toast.error((err as { message?: string })?.message || 'Failed to delete mapping');
    },
  });

  const addDialog = useDialog({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const editDialog = useDialog<Role>({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const handleDelete = useCallback(
    async (id: string) => {
      deleteRole(Endpoint.ROLE, 'DELETE', {
        roles: [{ role_id: id }],
      });
    },
    [deleteRole]
  );

  const handleAddClick = useCallback(() => {
    addDialog.open();
  }, [addDialog]);

  const handleEditClick = useCallback(
    (role: Role) => {
      editDialog.open(role);
    },
    [editDialog]
  );

  const columns: Column<Role>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        accessor: (r: Role) => r.name,
      },
      {
        key: 'description',
        header: 'Description',
        accessor: (r: Role) => r.description,
      },
    ],
    []
  );

  const actions: Action<Role>[] = useMemo(
    () => [
      {
        key: 'edit',
        icon: <Pencil className="h-4 w-4" />,
        onClick: handleEditClick,
        variant: 'ghost',
        size: 'icon',
      },
      {
        key: 'delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (role) => handleDelete(role.id),
        variant: 'ghost',
        size: 'icon',
        disabled: isDeleting,
      },
    ],
    [handleEditClick, handleDelete, isDeleting]
  );

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTable
        title="Roles"
        endpoint={Endpoint.ROLES}
        columns={columns}
        keyExtractor={(r) => r.id}
        showAddButton={true}
        onAddClick={handleAddClick}
        actions={actions}
        emptyMessage="No roles found"
        ref={tableRef}
      />

      <RoleDialog
        open={addDialog.isOpen}
        onOpenChange={(open) => !open && addDialog.close()}
        onSuccess={addDialog.onSuccess}
      />

      <RoleDialog
        open={editDialog.isOpen}
        onOpenChange={(open) => !open && editDialog.close()}
        role={editDialog.selectedItem}
        onSuccess={editDialog.onSuccess}
      />

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
