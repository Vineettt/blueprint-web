import { create } from 'zustand';
import { apiFetch, getErrorMessage } from '@/utils/apiUtils';
import { getStorageItem, setStorageItem } from '@/utils/storageUtils';
import { logger } from '@/utils/logger';

interface EntityState<T extends { id: string | number }> {
  items: T[];
  loading: boolean;
  error: string | null;
  fetchAll: (endpoint: string) => Promise<void>;
}

export function createEntityStore<T extends { id: string | number }>(storageKey: string) {
  return create<EntityState<T>>((set) => ({
    items: (getStorageItem(storageKey) as T[]) || [],
    loading: false,
    error: null,

    fetchAll: async (endpoint: string) => {
      set({ loading: true, error: null });
      try {
        const data = await apiFetch<unknown>(endpoint, { method: 'GET' });
        const items = ((data as { data?: T[] })?.data ??
          (data as { payload?: T[] })?.payload ??
          (Array.isArray(data) ? data : [])) as T[];
        setStorageItem(storageKey, items);
        set({ items, loading: false });
      } catch (err) {
        const message = getErrorMessage(err);
        logger.error(`[${storageKey}] fetchAll failed:`, err);
        set({ error: message, loading: false });
      }
    },
  }));
}
