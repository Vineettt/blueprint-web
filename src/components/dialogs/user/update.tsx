'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { mapApiErrorsToForm } from '@/utils/formErrorUtils';
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
import { apiFetch, ApiError, getErrorMessage } from '@/utils/apiUtils';
import { Endpoint } from '@/constants/route';
import { toast } from 'sonner';
import { RHFSelect } from '@/components/RHFSelect';
import { useConfirmedMutation } from '@/hooks/useConfirmedMutation';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_status: string;
  status?: string;
}

interface UserStatus {
  value: string;
  viewValue: string;
}

interface UpdateUserFormData {
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

interface UpdateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  user: User | null;
}

interface UserMutationResponse {
  message?: string;
  errors?: Record<string, string>;
}

interface StatusResponse {
  success: boolean;
  data?: { statusList?: UserStatus[] };
}

export function UpdateUserDialog({ open, onOpenChange, onSuccess, user }: UpdateUserDialogProps) {
  const [statuses, setStatuses] = useState<UserStatus[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
  } = useForm<UpdateUserFormData>({
    defaultValues: { first_name: '', last_name: '', email: '', status: '' },
  });

  useEffect(() => {
    if (!open || !user) return;

    reset({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      status: String(user.status),
    });

    const controller = new AbortController();

    const loadStatuses = async () => {
      try {
        setIsLoadingStatuses(true);
        const response = await apiFetch<StatusResponse>(Endpoint.USER_STATUS, {
          signal: controller.signal,
        });
        if (response.success) {
          setStatuses(response.data?.statusList || []);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('Failed to load status options');
        }
      } finally {
        setIsLoadingStatuses(false);
      }
    };

    loadStatuses();
    return () => controller.abort();
  }, [open, user, reset]);

  const { mutate, confirmOpen, confirmMethod, onConfirm, onCancel, isLoading } =
    useConfirmedMutation<UserMutationResponse>({
      onSuccess: (response) => {
        toast.success(response?.message || 'User updated successfully');
        reset();
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        const errorData =
          error instanceof ApiError ? (error.data as UserMutationResponse | undefined) : undefined;

        const hasFieldErrors = errorData
          ? mapApiErrorsToForm(errorData, setError, [], toast.error)
          : false;

        if (!hasFieldErrors) {
          const message = getErrorMessage(error);
          toast.error(message);
          setError('root', { message });
        }
      },
    });

  const onSubmit = useCallback(
    async (data: UpdateUserFormData) => {
      if (!user) return;
      await mutate(Endpoint.USER, 'PUT', {
        user: [
          {
            id: user.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            status: Number(data.status),
          },
        ],
      });
    },
    [user, mutate]
  );

  const handleCancel = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [onOpenChange, reset]);

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>First Name</Label>
                  <Input {...register('first_name', { required: 'First name is required' })} />
                  {errors.first_name && (
                    <span className="text-sm text-red-500">{errors.first_name.message}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Last Name</Label>
                  <Input {...register('last_name', { required: 'Last name is required' })} />
                  {errors.last_name && (
                    <span className="text-sm text-red-500">{errors.last_name.message}</span>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Email</Label>
                <Input disabled {...register('email', { required: 'Email is required' })} />
                {errors.email && (
                  <span className="text-sm text-red-500">{errors.email.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <RHFSelect
                  name="status"
                  control={control}
                  label="Status"
                  placeholder="Select status"
                  disabled={isLoadingStatuses}
                  rules={{ required: 'Status is required' }}
                  options={statuses.map((s) => ({ value: String(s.value), label: s.viewValue }))}
                  parseValue={(v) => v}
                />
                {errors.status && (
                  <span className="text-sm text-red-500">{errors.status.message}</span>
                )}
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingStatuses}>
                {isLoading ? 'Updating...' : 'Update User'}
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
