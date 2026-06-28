export interface StorageService<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export class LocalStorageService<T> implements StorageService<T> {
  get(key: string): Promise<T | null> {
    const raw = window.localStorage.getItem(key);
    return Promise.resolve(raw ? JSON.parse(raw) as T : null);
  }

  set(key: string, value: T): Promise<void> {
    window.localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  }
}

