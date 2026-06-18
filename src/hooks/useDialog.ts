'use client';

import { useState, useCallback } from 'react';

interface UseDialogOptions {
  onSuccess?: () => void;
}

interface UseDialogReturn<T> {
  isOpen: boolean;
  selectedItem: T | null;
  open: (item?: T) => void;
  close: () => void;
  onSuccess: () => void;
}

export function useDialog<T = void>({
  onSuccess: externalOnSuccess,
}: UseDialogOptions = {}): UseDialogReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const open = useCallback((item?: T) => {
    if (item !== undefined) {
      setSelectedItem(item);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedItem(null);
  }, []);

  const onSuccess = useCallback(() => {
    externalOnSuccess?.();
    close();
  }, [externalOnSuccess, close]);

  return {
    isOpen,
    selectedItem,
    open,
    close,
    onSuccess,
  };
}
