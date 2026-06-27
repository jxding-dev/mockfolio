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

  // Debounced write: avoids a synchronous localStorage write on every keystroke
  // or slider-drag frame. The latest value still lands ~200ms after activity stops.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch {
        // Quota exceeded — silently ignore
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [key, storedValue]);

  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      return next;
    });
  };

  return [storedValue, setValue] as const;
}
