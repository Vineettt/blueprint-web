'use client';

import { useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { GlobalLoading } from '@/components/ui/global-loading';
import { DataTable, Column, Action } from '@/components/data-table';
import { Endpoint } from '@/constants/route';
import { Pencil } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';

const UserRoleDialog = dynamic(
  () =>
    import('@/components/dialogs/user/role/user').then((mod) => ({ default: mod.UserRoleDialog })),
  {
    loading: () => <GlobalLoading message="Loading dialog..." />,
    ssr: false,
  }
);

interface UserRole {
  user_fk_id: string;
  email: string;
  roles: string;
}

export default function UserRole() {
  const tableRef = useRef<{ refetch: () => void }>(null);

  const editDialog = useDialog<UserRole>({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const handleEditClick = useCallback(
    (userRole: UserRole) => {
      editDialog.open(userRole);
    },
    [editDialog]
  );

  const columns: Column<UserRole>[] = useMemo(
    () => [
      { key: 'email', header: 'Email', accessor: (ur: UserRole) => ur.email },
      { key: 'roles', header: 'Roles', accessor: (ur: UserRole) => ur.roles },
    ],
    []
  );

  const actions: Action<UserRole>[] = useMemo(
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
      <DataTable<UserRole>
        title="User Role"
        endpoint={Endpoint.USER_ROLE_MAPPINGS}
        columns={columns}
        keyExtractor={(ur) => ur.user_fk_id}
        actions={actions}
        emptyMessage="No user roles found"
        ref={tableRef}
      />
      <UserRoleDialog
        open={editDialog.isOpen}
        onOpenChange={(open) => !open && editDialog.close()}
        userRole={editDialog.selectedItem}
        onSuccess={() => {
          editDialog.onSuccess();
          editDialog.close();
        }}
      />
    </div>
  );
}
