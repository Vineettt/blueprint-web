'use client';

import { useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { mapApiErrorsToForm } from '@/utils/formErrorUtils';
import { apiFetch, ApiError, getErrorMessage } from '@/utils/apiUtils';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { Endpoint } from '@/constants/route';
import { toast } from 'sonner';

interface AddUserFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface AddUserResponse {
  message?: string;
  errors?: Record<string, string>;
}

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<AddUserFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    },
  });

  const handleCancel = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [onOpenChange, reset]);

  const onSubmit = useCallback(
    async (data: AddUserFormData) => {
      try {
        setIsLoading(true);

        const response = await apiFetch<AddUserResponse>(Endpoint.USER, {
          method: 'POST',
          body: JSON.stringify(data),
        });

        toast.success(response.message || 'User created successfully!');

        reset();
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        // ✅ FIX: ensure correct typing instead of unknown
        const errorData =
          error instanceof ApiError ? (error.data as AddUserResponse | undefined) : undefined;

        const hasFieldErrors = errorData
          ? mapApiErrorsToForm(errorData, setError, [], toast.error)
          : false;

        if (!hasFieldErrors) {
          const message = getErrorMessage(error);

          toast.error(message);

          setError('root', {
            message,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [reset, onOpenChange, onSuccess, setError]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>

                <Input
                  id="first_name"
                  type="text"
                  placeholder="First Name"
                  {...register('first_name', {
                    required: 'First name is required',
                  })}
                />

                {errors.first_name && (
                  <span className="text-sm text-red-500">{errors.first_name.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>

                <Input
                  id="last_name"
                  type="text"
                  placeholder="Last Name"
                  {...register('last_name', {
                    required: 'Last name is required',
                  })}
                />

                {errors.last_name && (
                  <span className="text-sm text-red-500">{errors.last_name.message}</span>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />

              {errors.password && (
                <span className="text-sm text-red-500">{errors.password.message}</span>
              )}
            </div>

            {errors.root && <span className="text-sm text-red-500">{errors.root.message}</span>}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Add User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddUserDialog;
