'use client';

import { useState, useCallback, useRef } from 'react';
import {
  executeApiMutation,
  executeConfirmedMutation,
  isIgnoreKeyError,
} from '@/utils/mutationUtils';

type MutationMethod = 'PUT' | 'DELETE';

interface UseConfirmedMutationOptions<R> {
  onSuccess?: (result: R) => void;
  onError?: (error: unknown) => void;
}

interface UseConfirmedMutationReturn {
  mutate: (endpoint: string, method: MutationMethod, body?: unknown) => Promise<void>;
  confirmOpen: boolean;
  confirmMethod: MutationMethod;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function useConfirmedMutation<R = unknown>(
  options: UseConfirmedMutationOptions<R> = {}
): UseConfirmedMutationReturn {
  const { onSuccess, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMethod, setConfirmMethod] = useState<MutationMethod>('PUT');

  const pendingRef = useRef<{
    endpoint: string;
    method: MutationMethod;
    body?: unknown;
  } | null>(null);

  const mutate = useCallback(
    async (endpoint: string, method: MutationMethod, body?: unknown) => {
      setIsLoading(true);
      try {
        const result = await executeApiMutation<R>(endpoint, method, body);
        onSuccess?.(result);
      } catch (error) {
        if (isIgnoreKeyError(error)) {
          pendingRef.current = { endpoint, method, body };
          setConfirmMethod(method);
          setConfirmOpen(true);
        } else {
          onError?.(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const onConfirm = useCallback(async () => {
    if (!pendingRef.current) return;

    const { endpoint, method, body } = pendingRef.current;
    setIsLoading(true);
    setConfirmOpen(false);

    try {
      const result = await executeConfirmedMutation<R>(endpoint, method, body);
      pendingRef.current = null;
      onSuccess?.(result);
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  const onCancel = useCallback(() => {
    pendingRef.current = null;
    setConfirmOpen(false);
  }, []);

  return {
    mutate,
    confirmOpen,
    confirmMethod,
    onConfirm,
    onCancel,
    isLoading,
  };
}
