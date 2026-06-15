import { useState, useEffect } from 'react';

export function useLocalStorageState<T>(key: string, defaultValue: T | (() => T)) {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved) as T;
      } catch (err) {
        console.error(`Error parsing localStorage key "${key}":`, err);
      }
    }
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}
