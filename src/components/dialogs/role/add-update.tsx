'use client';

import { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Endpoint } from '@/constants/route';
import { toast } from 'sonner';
import { apiFetch, getErrorMessage } from '@/utils/apiUtils';
import { useConfirmedMutation } from '@/hooks/useConfirmedMutation';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface RoleFormData {
  name: string;
  description: string;
}

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  role?: Role | null;
}

interface RoleResponse {
  warnings?: { message: string };
  message?: string;
}

export function RoleDialog({ open, onOpenChange, onSuccess, role }: RoleDialogProps) {
  const isEditing = !!role;
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: role?.name || '', description: role?.description || '' });
    }
  }, [open, role, reset]);

  const handleCancel = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [onOpenChange, reset]);

  const { mutate, confirmOpen, confirmMethod, onConfirm, onCancel, isLoading } =
    useConfirmedMutation<RoleResponse>({
      onSuccess: (response) => {
        if (response?.warnings?.message) {
          toast.warning(response.warnings.message);
          return;
        }
        toast.success(
          response?.message || `Role ${isEditing ? 'updated' : 'created'} successfully`
        );
        reset();
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    });

  const onSubmit = async (data: RoleFormData) => {
    if (isEditing && data.name === role?.name && data.description === (role?.description ?? '')) {
      toast.info('No changes detected');
      onOpenChange(false);
      return;
    }

    if (isEditing) {
      const payload = { name: data.name, description: data.description, id: role?.id };
      await mutate(Endpoint.ROLE, 'PUT', { roles: [payload] });
    } else {
      try {
        setIsCreating(true);
        const response = await apiFetch<RoleResponse>(Endpoint.ROLE, {
          method: 'POST',
          body: JSON.stringify({ name: data.name, description: data.description }),
        });
        if (response?.warnings?.message) {
          toast.warning(response.warnings.message);
          return;
        }
        toast.success(response?.message || 'Role created successfully');
        reset();
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsCreating(false);
      }
    }
  };

  const isBusy = isLoading || isCreating;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Role' : 'Add Role'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Role name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 1, message: 'Name cannot be empty' },
                  })}
                />
                {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Role description"
                  {...register('description')}
                />
                {errors.description && (
                  <span className="text-sm text-red-500">{errors.description.message}</span>
                )}
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isBusy}>
                Cancel
              </Button>
              <Button type="submit" disabled={isBusy}>
                {isBusy
                  ? isEditing
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditing
                    ? 'Update'
                    : 'Add'}
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

export default RoleDialog;
