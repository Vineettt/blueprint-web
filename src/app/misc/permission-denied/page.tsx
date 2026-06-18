'use client';

import { useRouter } from 'next/navigation';
import { useAuthProtection } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function PermissionDenied() {
  const router = useRouter();
  const { logout } = useAuthProtection();
  const { authStatus } = useAuthStore();

  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <svg
              className="h-16 w-16 text-destructive mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You don&apos;t have permission to access this page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleGoBack} className="w-full" variant="default">
            Go Back
          </Button>

          {authStatus === 'authenticated' && (
            <Button onClick={logout} className="w-full" variant="destructive">
              Logout
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
