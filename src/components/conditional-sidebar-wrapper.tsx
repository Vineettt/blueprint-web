'use client';

import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useAuthStore } from '@/stores/authStore';
import { usePathname } from 'next/navigation';
import { publicPaths } from '@/constants/permission';

interface ConditionalSidebarWrapperProps {
  children: React.ReactNode;
}

export function ConditionalSidebarWrapper({ children }: ConditionalSidebarWrapperProps) {
  const { authStatus } = useAuthStore();
  const pathname = usePathname();

  const isPublicRoute = publicPaths.includes(pathname);

  const shouldShowSidebar = authStatus === 'authenticated' && !isPublicRoute;

  return (
    <div>
      {shouldShowSidebar ? (
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1" />
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      )}
    </div>
  );
}
