import { apiFetch, ApiError, getErrorMessage } from './apiUtils';
import { toast } from 'sonner';

export const IGNORE_KEY_ERROR = 'IGNORE_KEY_REQUIRED';
export const IGNORE_KEY_VALUE = 'CONFIRMED';

/**
 * Injects IGNORE_KEY into a request body.
 * Only called after the user has confirmed the action.
 */
export function withIgnoreKey(body?: unknown): unknown {
  if (body === undefined || body === null) return { IGNORE_KEY: IGNORE_KEY_VALUE };
  if (typeof body === 'object' && !Array.isArray(body)) {
    return { ...(body as Record<string, unknown>), IGNORE_KEY: IGNORE_KEY_VALUE };
  }
  return body;
}

export async function executeApiMutation<R = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  body?: unknown
): Promise<R> {
  return apiFetch<R>(endpoint, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function executeConfirmedMutation<R = unknown>(
  endpoint: string,
  method: 'PUT' | 'DELETE',
  body?: unknown
): Promise<R> {
  const enrichedBody = withIgnoreKey(body);
  return apiFetch<R>(endpoint, {
    method,
    body: JSON.stringify(enrichedBody),
  });
}

export function isIgnoreKeyError(error: unknown): boolean {
  if (error instanceof ApiError) {
    const data = error.data as { error?: string } | undefined;
    return data?.error === IGNORE_KEY_ERROR;
  }
  return false;
}

export function normalizeApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError(500, error instanceof Error ? error.message : 'Unknown error');
}

export function handleMutationError(apiError: ApiError, fallbackMessage?: string) {
  toast.error(getErrorMessage(apiError) || fallbackMessage || 'An error occurred');
}
