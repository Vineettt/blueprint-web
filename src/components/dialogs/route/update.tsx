'use client';

import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/utils/apiUtils';
import { Endpoint } from '@/constants/route';
import { toast } from 'sonner';
import { RHFSelect } from '@/components/RHFSelect';
import { useConfirmedMutation } from '@/hooks/useConfirmedMutation';

interface Route {
  id: string;
  endpoint: string;
  method: string;
  status: number;
}

interface RouteFormData {
  status: string;
}

interface UpdateRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  route?: Route | null;
}

interface RouteMutationResponse {
  message?: string;
  success?: boolean;
}

const routeStatusOptions = [
  { value: '0', label: 'Public' },
  { value: '1', label: 'Protected' },
];

export function UpdateRouteDialog({
  open,
  onOpenChange,
  onSuccess,
  route,
}: UpdateRouteDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<RouteFormData>({
    defaultValues: { status: '' },
  });

  useEffect(() => {
    if (open && route) {
      reset({ status: route.status === 0 || route.status === 1 ? String(route.status) : '' });
    }
  }, [open, route, reset]);

  const { mutate, confirmOpen, confirmMethod, onConfirm, onCancel, isLoading } =
    useConfirmedMutation<RouteMutationResponse>({
      onSuccess: (response) => {
        toast.success(response?.message || 'Route updated successfully');
        reset();
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        const message = getErrorMessage(error);
        toast.error(message);
        setError('root', { message });
      },
    });

  const onSubmit = useCallback(
    async (data: RouteFormData) => {
      if (!route) return;
      if (data.status === String(route.status)) {
        toast.info('No changes detected');
        onOpenChange(false);
        return;
      }
      await mutate(Endpoint.ROUTE, 'PUT', { id: route.id, status: data.status });
    },
    [route, onOpenChange, mutate]
  );

  const handleCancel = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [onOpenChange, reset]);

  if (!route) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Route</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 py-4">
              <RHFSelect<RouteFormData>
                name="status"
                control={control}
                label="Status"
                placeholder="Select status"
                options={routeStatusOptions}
                rules={{ required: 'Status is required' }}
              />
              {errors.status && (
                <span className="text-sm text-red-500">{errors.status.message}</span>
              )}
              <div className="text-sm text-muted-foreground">
                Endpoint: <strong>{route.endpoint}</strong> | Method:{' '}
                <strong>{route.method}</strong>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
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

export default UpdateRouteDialog;
