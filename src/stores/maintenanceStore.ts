import { create } from 'zustand';
import { apiFetch, ApiError, getErrorMessage } from '@/utils/apiUtils';
import { Endpoint } from '@/constants/route';

interface MaintenanceState {
  isMaintenanceMode: boolean;
  isChecking: boolean;
  error: string | null;
  checkServerStatus: (signal?: AbortSignal) => Promise<void>;
  retry: () => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  isMaintenanceMode: false,
  isChecking: true,
  error: null,

  checkServerStatus: async (signal?: AbortSignal) => {
    set({ isChecking: true, error: null });

    try {
      const response = await apiFetch<{ message: string; maintenance?: boolean }>(Endpoint.HEALTH, {
        signal,
      });

      if (response.maintenance === true) {
        set({
          isMaintenanceMode: true,
          error: response.message || 'Server is under maintenance',
        });
      } else {
        set({ isMaintenanceMode: false });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          set({ isMaintenanceMode: false });
        } else {
          set({
            isMaintenanceMode: true,
            error: getErrorMessage(err) || 'Server is temporarily unavailable',
          });
        }
      } else {
        set({
          isMaintenanceMode: true,
          error:
            getErrorMessage(err) || 'Unable to connect to server. Please check your connection.',
        });
      }
    } finally {
      set({ isChecking: false });
    }
  },

  retry: async () => {
    const { checkServerStatus } = useMaintenanceStore.getState();
    await checkServerStatus();
  },
}));
