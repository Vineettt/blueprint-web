'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GlobalLoading } from '@/components/ui/global-loading';
import { useAuthProtection } from './AuthProvider';

interface PermissionGuardProps {
  children: React.ReactNode;
}

export function PermissionGuard({ children }: PermissionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { canAccessPath } = useAuthProtection();

  const allowed = canAccessPath(pathname);

  useEffect(() => {
    if (!allowed) {
      router.replace('/misc/permission-denied');
    }
  }, [allowed, router]);

  if (!allowed) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  return <>{children}</>;
}
