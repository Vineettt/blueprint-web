import { Endpoint } from '@/constants/route';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
let refreshPromise: Promise<boolean> | null = null;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getValidToken(): Promise<string | null> {
  const store = useAuthStore.getState();
  const token = store.loadToken();
  if (store.refreshBlocked) {
    return null;
  }
  if (token && !store.isTokenExpired?.(token)) {
    return token;
  }
  if (!refreshPromise) {
    refreshPromise = store.refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  const refreshed = await refreshPromise;
  if (!refreshed) return null;
  return store.loadToken();
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const store = useAuthStore.getState();
  if (store.authStatus === 'loggingOut' && endpoint !== Endpoint.LOGOUT) {
    return new Promise(() => {});
  }

  const url = `${API_BASE_URL}/api/${endpoint.replace(/^\//, '')}`;

  const token = await getValidToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': 'eu',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    const tokenStr = typeof token === 'string' ? token.replace(/^"|"$/g, '') : String(token);
    headers['Authorization'] = tokenStr;
  }

  const requestInit: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, requestInit);
    const data = await response.json();

    if (!response.ok && data?.warnings) {
      return data;
    }

    if (!response.ok) {
      let errorMessage = data.message || 'Request failed';
      if (!data.message && data.errors) {
        const errorMessages = Object.values(data.errors) as string[];
        errorMessage = errorMessages[0] || errorMessage;
      }

      throw new ApiError(response.status, errorMessage, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error');
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      if (parsed.errors) {
        const errorMessages = Object.values(parsed.errors) as string[];
        return errorMessages[0] || 'An error occurred';
      }
      return parsed.message || error;
    } catch {
      return error as string;
    }
  }

  if (error instanceof ApiError && error.data) {
    if (typeof error.data === 'object' && error.data !== null && 'errors' in error.data) {
      const errorMessages = Object.values(
        (error.data as { errors: Record<string, string> }).errors
      ) as string[];
      return errorMessages[0] || 'An error occurred';
    }
  }

  if (typeof error === 'object' && error !== null) {
    if ('errors' in error) {
      const errorMessages = Object.values(
        (error as { errors: Record<string, string> }).errors
      ) as string[];
      return errorMessages[0] || 'An error occurred';
    }
    if ('message' in error) {
      return (error as { message: string }).message;
    }
  }

  return 'An unexpected error occurred';
};
