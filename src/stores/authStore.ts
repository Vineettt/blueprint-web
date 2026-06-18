import { create } from 'zustand';
import { apiFetch } from '@/utils/apiUtils';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storageUtils';
import { Endpoint } from '@/constants/route';
import { STORAGE_KEYS } from '@/constants/storage';
import { User, UserPermission } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type AuthStateType = 'initializing' | 'authenticated' | 'unauthenticated' | 'loggingOut';

async function rawAuthFetch(endpoint: Endpoint, options: RequestInit = {}) {
  return fetch(`${API_BASE_URL}/api/${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });
}

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: UserPermission[];
  authStatus: AuthStateType;
  refreshBlocked: boolean;

  storeUserData: (user: User, token?: string) => void;
  loadToken: () => string | null;
  logout: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  isTokenExpired: (token: string) => boolean;
  setRefreshBlocked: (blocked: boolean) => void;

  clearAuthState: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const getStoredToken = (): string | null => {
    return (getStorageItem(STORAGE_KEYS.TOKEN) as string | null) || null;
  };

  const getStoredUser = (): User | null => {
    return (getStorageItem(STORAGE_KEYS.USER) as User | null) || null;
  };

  const syncAuthState = (
    user: User | null,
    token: string | null,
    permissions: UserPermission[]
  ) => {
    set({ user, token, permissions, authStatus: user ? 'authenticated' : 'unauthenticated' });
  };

  return {
    user: getStoredUser(),
    token: getStoredToken(),
    permissions: (getStorageItem(STORAGE_KEYS.PERMISSIONS) as UserPermission[]) || [],
    refreshBlocked: false,

    authStatus: 'initializing',

    storeUserData: (user: User, token?: string) => {
      const finalToken = token ?? getStoredToken();

      setStorageItem(STORAGE_KEYS.USER, user);
      setStorageItem(STORAGE_KEYS.PERMISSIONS, user.permissions || []);

      if (finalToken) {
        setStorageItem(STORAGE_KEYS.TOKEN, finalToken);
      }

      syncAuthState(user, finalToken, user.permissions || []);
    },

    loadToken: () => getStoredToken(),

    logout: async () => {
      const state = get();

      if (state.authStatus === 'loggingOut') return true;

      set({ authStatus: 'loggingOut' });

      try {
        await apiFetch(Endpoint.LOGOUT, { method: 'GET' });
      } finally {
        state.clearAuthState();
        set({ authStatus: 'unauthenticated' });
      }

      return true;
    },

    initializeAuth: async () => {
      set({ authStatus: 'initializing' });

      const token = getStoredToken();

      if (!token) {
        set({ authStatus: 'unauthenticated' });
        return;
      }

      try {
        const response = await apiFetch<{
          success: boolean;
          data: { user: User };
        }>(Endpoint.USER);

        if (!response?.success) {
          const state = get();
          state.clearAuthState();
          return;
        }

        const payload = response.data?.user;

        const roleNames = payload.roles?.map((r) => r) || [];
        const userPermissions: UserPermission[] = payload.permissions || [];

        const userData: User = {
          ...payload,
          id: payload.id,
          roles: roleNames,
          permissions: userPermissions,
        };

        syncAuthState(userData, token, userPermissions);

        setStorageItem(STORAGE_KEYS.USER, userData);
        setStorageItem(STORAGE_KEYS.PERMISSIONS, userPermissions);
        set({ refreshBlocked: false });
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        const state = get();
        state.clearAuthState();
      }
    },

    refreshAccessToken: async () => {
      try {
        const response = await rawAuthFetch(Endpoint.REFRESH_TOKEN, { method: 'GET' });

        const data = await response.json();

        if (response.ok && data?.success && data?.data?.token) {
          setStorageItem(STORAGE_KEYS.TOKEN, data.data.token);

          set((state) => ({
            ...state,
            token: data.data.token,
            authStatus: 'authenticated',
          }));

          return true;
        } else {
          if ((data as unknown as { error: string }).error === 'MISSING_REFRESH_TOKEN') {
            set({ refreshBlocked: true });
          }
        }

        return false;
      } catch (error) {
        console.error('Token refresh error:', error);
        return false;
      }
    },

    isTokenExpired: (token: string) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
      } catch {
        return true;
      }
    },

    clearAuthState: () => {
      removeStorageItem(STORAGE_KEYS.TOKEN);
      removeStorageItem(STORAGE_KEYS.USER);
      removeStorageItem(STORAGE_KEYS.PERMISSIONS);

      set({
        user: null,
        token: null,
        permissions: [],
        authStatus: 'unauthenticated',
        refreshBlocked: false,
      });
    },
    setRefreshBlocked: (blocked: boolean) => {
      set({ refreshBlocked: blocked });
    },
  };
});
