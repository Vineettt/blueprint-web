'use client';

import { ReactNode, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ConditionalSidebarWrapper } from '@/components/conditional-sidebar-wrapper';
import { MaintenanceGuard } from '@/components/maintenance-ui';
import { useAuthStore } from '@/stores/authStore';
import { AuthProvider } from '@/contexts/AuthProvider';
import { PermissionGuard } from '@/contexts/PermissionGuard';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MaintenanceGuard>
        <AuthProvider>
          <PermissionGuard>
            <ConditionalSidebarWrapper>{children}</ConditionalSidebarWrapper>
          </PermissionGuard>
        </AuthProvider>
      </MaintenanceGuard>
    </ThemeProvider>
  );
}
