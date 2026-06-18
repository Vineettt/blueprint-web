'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { apiFetch } from '@/utils/apiUtils';
import { Endpoint } from '@/constants/route';

import FormMultiSelectField from '@/components/FormMultiSelectField';

interface Role {
  id: string;
  name: string;
}

interface RouteItem {
  id: string;
  endpoint: string;
  method: string;
  status: number;
}

interface RoleRouteMappingFormData {
  routeIds: string[];
}

interface RoleRouteResponse {
  data?: {
    payload?: RouteItem[];
  };
}

interface CreateMappingResponse {
  success?: boolean;
  message?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  role?: Role | null;
}

export function RoleRouteMappingDialog({ open, onOpenChange, onSuccess, role }: Props) {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasFetchedRef = useRef(false);
  const prevOpenRef = useRef(false);

  const { control, handleSubmit, reset } = useForm<RoleRouteMappingFormData>({
    defaultValues: { routeIds: [] },
  });

  const roleId = role?.id;

  // ✅ FETCH ONLY ON OPEN TRANSITION (false → true)
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;

    prevOpenRef.current = open;

    if (!justOpened || !roleId) return;

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchRoutes = async () => {
      try {
        setIsLoadingRoutes(true);

        const response = await apiFetch<RoleRouteResponse>(Endpoint.ROUTE, {
          method: 'POST',
          body: JSON.stringify({
            role: roleId,
            status: [1],
            unassignedOnly: true,
          }),
        });

        setRoutes(response?.data?.payload ?? []);
      } catch {
        toast.error('Failed to load routes');
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, [open, roleId]);

  // reset fetch flag when dialog closes
  useEffect(() => {
    if (!open) {
      hasFetchedRef.current = false;
    }
  }, [open]);

  const routeOptions = useMemo(
    () =>
      routes.map((route) => ({
        value: route.id,
        label: `${route.endpoint} [${route.method.toUpperCase()}]`,
      })),
    [routes]
  );

  const onSubmit = useCallback(
    async (data: RoleRouteMappingFormData) => {
      if (!roleId) return;

      try {
        setIsSaving(true);

        const body = {
          mapping: data.routeIds.map((routeId) => ({
            route_id: routeId,
            role_id: roleId,
          })),
        };

        const response = await apiFetch<CreateMappingResponse>(Endpoint.ROLE_ROUTE_MAPPING, {
          method: 'POST',
          body: JSON.stringify(body),
        });

        if (response?.success) {
          toast.success('Mappings saved successfully');

          reset({ routeIds: [] });
          onOpenChange(false);
          onSuccess?.();
          return;
        }

        toast.error(response?.message ?? 'Failed to save mappings');
      } catch {
        toast.error('Error while saving mappings');
      } finally {
        setIsSaving(false);
      }
    },
    [roleId, reset, onOpenChange, onSuccess]
  );

  const handleCancel = useCallback(() => {
    reset({ routeIds: [] });
    onOpenChange(false);
  }, [reset, onOpenChange]);

  const isBusy = isLoadingRoutes || isSaving;

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modify Role Route Mapping</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 py-4">
            <div className="text-sm text-muted-foreground">
              Role: <strong>{role.name}</strong>
            </div>

            <FormMultiSelectField
              name="routeIds"
              control={control}
              label="Routes"
              options={routeOptions}
              placeholder={isLoadingRoutes ? 'Loading routes...' : 'Select routes'}
              disabled={isBusy}
              requiredMessage="At least one route is required"
            />
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isBusy}>
              Cancel
            </Button>

            <Button type="submit" disabled={isBusy}>
              {isBusy ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RoleRouteMappingDialog;
