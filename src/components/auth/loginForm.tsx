'use client';

import { useForm } from 'react-hook-form';
import { mapApiErrorsToForm } from '@/utils/formErrorUtils';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch, getErrorMessage } from '@/utils/apiUtils';
import { Endpoint } from '@/constants/route';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types/auth';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    token?: string;
  };
  error?: string;
  errors?: Record<string, string>;
}

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const { storeUserData, setRefreshBlocked } = useAuthStore();

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await apiFetch<LoginResponse>(Endpoint.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (response.success && response.data?.user) {
        const user: User = response.data.user;
        storeUserData(user, response.data.token);
        toast.success(response.message || 'Login successful!');
        setRefreshBlocked(false);
        router.push('/dashboard');
      } else {
        const hasFieldErrors = mapApiErrorsToForm(response, setError, [], toast.error);

        if (!hasFieldErrors) {
          toast.error(getErrorMessage(response) || 'Login failed');
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
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
            <label htmlFor="password">Password</label>
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={togglePassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password.message}</span>
            )}
          </div>
          <div className="flex justify-between gap-2">
            <Button type="submit" variant="outline" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
