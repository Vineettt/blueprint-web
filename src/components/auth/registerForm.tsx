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

interface RegisterFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    token?: string;
  };
  error?: string;
  errors?: Record<string, string>;
}

export function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const { storeUserData } = useAuthStore();

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await apiFetch<RegisterResponse>(Endpoint.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
        }),
      });

      if (response.success && response.data?.user) {
        const user: User = response.data.user;
        storeUserData(user, response.data.token);
        toast.success(response.message || 'Registration successful!');
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
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <label htmlFor="first_name">First Name</label>
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
            <label htmlFor="last_name">Last Name</label>
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
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
