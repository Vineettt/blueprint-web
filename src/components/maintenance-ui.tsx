'use client';

import { useEffect } from 'react';
import { Wrench } from 'lucide-react';

import { useMaintenanceStore } from '@/stores/maintenanceStore';
import { GlobalLoading } from '@/components/ui/global-loading';
import { StatusScreen } from '@/components/StatusScreen';

const maintenanceIcon = (
  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
    <Wrench className="h-8 w-8 text-yellow-600" />
  </div>
);

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { isMaintenanceMode, isChecking, error, checkServerStatus } = useMaintenanceStore();

  useEffect(() => {
    const controller = new AbortController();

    checkServerStatus(controller.signal);

    return () => controller.abort();
  }, [checkServerStatus]);

  if (isChecking) {
    return <GlobalLoading message="Checking..." />;
  }

  if (isMaintenanceMode) {
    return (
      <StatusScreen
        icon={maintenanceIcon}
        title="Maintenance"
        message={error ?? 'Maintenance Mode.'}
      />
    );
  }

  return <>{children}</>;
}
