import { create } from 'zustand';
import { apiFetch } from '@/utils/apiUtils';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storageUtils';
import { Endpoint, HttpMethod } from '@/constants/route';
import { STORAGE_KEYS } from '@/constants/storage';

interface RouteItem {
  id: string;
  endpoint: string;
  method: string;
  handler: string;
}

interface RoutesState {
  items: RouteItem[];
  loading: boolean;
  error: string | null;
  fetchRoutesForRole: (roleId: string) => Promise<RouteItem[]>;
  clearRoutes: () => void;
}

export const useRoutesStore = create<RoutesState>(() => ({
  items: (getStorageItem(STORAGE_KEYS.ROUTES) as RouteItem[]) || [],
  loading: false,
  error: null,

  fetchRoutesForRole: async (roleId: string) => {
    useRoutesStore.setState({ loading: true, error: null });

    try {
      const response = await apiFetch<{ payload: RouteItem[] }>(Endpoint.ROUTE, {
        method: HttpMethod.POST,
        body: JSON.stringify({ role: roleId }),
      });
      const routes = response?.payload || [];
      setStorageItem(STORAGE_KEYS.ROUTES, routes);
      useRoutesStore.setState({ items: routes, loading: false });
      return routes;
    } catch (error) {
      useRoutesStore.setState({ error: 'Failed to fetch routes', loading: false });
      throw error;
    }
  },

  clearRoutes: () => {
    removeStorageItem(STORAGE_KEYS.ROUTES);
    useRoutesStore.setState({ items: [] });
  },
}));
