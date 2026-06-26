import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T, normalize?: (value: unknown) => T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (normalize ? normalize(JSON.parse(item)) : JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Quota exceeded — silently ignore
    }
  }, [key, storedValue]);

  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      return next;
    });
  };

  return [storedValue, setValue] as const;
}
