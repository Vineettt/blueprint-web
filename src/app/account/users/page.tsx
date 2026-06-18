'use client';

import { useRef, useMemo, useCallback } from 'react';
import { DataTable, Column, Action } from '@/components/data-table';
import { Endpoint } from '@/constants/route';
import { Pencil } from 'lucide-react';
import { AddUserDialog } from '@/components/dialogs/user/add';
import { UpdateUserDialog } from '@/components/dialogs/user/update';
import { useDialog } from '@/hooks/useDialog';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_status: string;
}

type UserStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'NOT_ACTIVATED';

const statusStyles: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
  LOCKED: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400',
  SUSPENDED: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
  NOT_ACTIVATED: 'bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400',
};

export function UserStatusBadge({ status }: { status: string }) {
  const key = status?.toUpperCase() as UserStatus;

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border ${statusStyles[key] ?? statusStyles.NOT_ACTIVATED}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function Users() {
  const tableRef = useRef<{ refetch: () => void }>(null);

  const addDialog = useDialog({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const editDialog = useDialog<User>({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const handleAddClick = useCallback(() => {
    addDialog.open();
  }, [addDialog]);

  const handleEditClick = useCallback(
    (user: User) => {
      editDialog.open(user);
    },
    [editDialog]
  );

  const columns: Column<User>[] = useMemo(
    () => [
      { key: 'email', header: 'Email', accessor: (u) => u.email },
      { key: 'first_name', header: 'First Name', accessor: (u) => u.first_name },
      { key: 'last_name', header: 'Last Name', accessor: (u) => u.last_name },
      {
        key: 'user_status',
        header: 'Status',
        accessor: (u) => u.user_status,
        cell: (u) => <UserStatusBadge status={u.user_status} />,
      },
    ],
    []
  );

  const actions: Action<User>[] = useMemo(
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
      <DataTable
        title="Users"
        endpoint={Endpoint.USERS}
        columns={columns}
        keyExtractor={(u) => u.id}
        showAddButton={true}
        onAddClick={handleAddClick}
        actions={actions}
        emptyMessage="No users found"
        ref={tableRef}
      />
      {addDialog.isOpen && (
        <AddUserDialog
          open={addDialog.isOpen}
          onOpenChange={(open) => !open && addDialog.close()}
          onSuccess={addDialog.onSuccess}
        />
      )}
      {editDialog.isOpen && editDialog.selectedItem && (
        <UpdateUserDialog
          open={editDialog.isOpen}
          onOpenChange={(open) => !open && editDialog.close()}
          onSuccess={editDialog.onSuccess}
          user={editDialog.selectedItem}
        />
      )}
    </div>
  );
}
