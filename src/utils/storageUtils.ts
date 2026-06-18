const storageAvailable = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getStorage = (): Storage | null => (storageAvailable() ? window.localStorage : null);

export const getStorageItem = (key: string): unknown => {
  const storage = getStorage();
  if (!storage) return null;

  const item = storage.getItem(key);
  if (!item) return null;

  try {
    return JSON.parse(item);
  } catch {
    return item;
  }
};

export const setStorageItem = (key: string, value: unknown): void => {
  const storage = getStorage();
  if (!storage) return;

  if (typeof value === 'string') {
    storage.setItem(key, value);
  } else {
    storage.setItem(key, JSON.stringify(value));
  }
};

export const removeStorageItem = (key: string): void => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(key);
};
