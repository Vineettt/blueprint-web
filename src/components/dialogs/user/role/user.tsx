'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/utils/apiUtils';
import { Endpoint } from '@/constants/route';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/ui/multi-select';
import { useConfirmedMutation } from '@/hooks/useConfirmedMutation';

interface Role {
  id: string;
  name: string;
}

interface UserRole {
  user_fk_id: string;
  email: string;
  roles: string;
}

interface UserRoleFormData {
  roleIds: string[];
}

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userRole: UserRole | null;
}

interface UserRoleMutationResponse {
  message?: string;
  info?: string;
  errors?: Record<string, string>;
  success?: boolean;
}

export function UserRoleDialog({ open, onOpenChange, onSuccess, userRole }: UserRoleDialogProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const { control, handleSubmit, reset } = useForm<UserRoleFormData>({
    defaultValues: { roleIds: [] },
  });

  const roleOptions = useMemo(
    () => roles.map((role) => ({ value: role.id, label: role.name })),
    [roles]
  );

  useEffect(() => {
    if (!open || !userRole) return;

    const controller = new AbortController();

    const loadRoles = async () => {
      try {
        setIsLoadingRoles(true);

        interface RolesResponse {
          data?: { payload?: Role[] };
        }

        const response = await apiFetch<RolesResponse>(Endpoint.ROLES, {
          signal: controller.signal,
        });

        const roleList = response?.data?.payload ?? [];
        setRoles(roleList);

        const currentRoleNames = new Set(
          userRole.roles
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean)
        );
        const selected = roleList.filter((r) => currentRoleNames.has(r.name)).map((r) => r.id);
        reset({ roleIds: selected });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error('Failed to load roles');
        }
      } finally {
        setIsLoadingRoles(false);
      }
    };

    loadRoles();
    return () => controller.abort();
  }, [open, userRole, reset]);

  const { mutate, confirmOpen, confirmMethod, onConfirm, onCancel, isLoading } =
    useConfirmedMutation<UserRoleMutationResponse>({
      onSuccess: (response) => {
        if (response?.info) {
          toast.info(response.info);
          return;
        }
        if (response?.errors?.no) {
          toast.info(response.errors.no);
          onOpenChange(false);
          return;
        }
        toast.success(response?.message || 'User roles updated successfully');
        reset();
        onOpenChange(false);
        onSuccess?.();
      },
      onError: () => {
        toast.error('An error occurred while updating user roles');
      },
    });

  const onSubmit = useCallback(
    async (data: UserRoleFormData) => {
      if (!userRole) return;

      const currentRoleNames = new Set(
        userRole.roles
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean)
      );
      const prevRoleIds = roles.filter((r) => currentRoleNames.has(r.name)).map((r) => r.id);
      const newRoleIds = data.roleIds;

      const changed =
        newRoleIds.length !== prevRoleIds.length ||
        newRoleIds.some((id) => !prevRoleIds.includes(id));

      if (!changed) {
        toast.info('No changes detected');
        return;
      }

      await mutate(Endpoint.USER_ROLE_MAPPING, 'PUT', {
        mapping: newRoleIds.map((roleId) => ({
          user_fk_id: userRole.user_fk_id,
          role_fk_id: roleId,
        })),
      });
    },
    [userRole, roles, mutate]
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!userRole) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="roles">Roles</Label>
                <Controller
                  name="roleIds"
                  control={control}
                  rules={{ required: 'At least one role is required' }}
                  render={({ field }) => (
                    <MultiSelect
                      options={roleOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder={isLoadingRoles ? 'Loading roles...' : 'Select roles'}
                      disabled={isLoadingRoles || isLoading}
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingRoles}>
                {isLoading ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={(o) => !o && onCancel()}
        onConfirm={onConfirm}
        method={confirmMethod}
        isLoading={isLoading}
      />
    </>
  );
}

export default UserRoleDialog;
