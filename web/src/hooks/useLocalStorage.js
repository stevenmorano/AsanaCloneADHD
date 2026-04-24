/**
 * useLocalStorage.js
 *
 * A thin wrapper around useState that persists to localStorage.
 * Gracefully handles JSON parse/stringify errors.
 *
 * Usage:
 *   const [value, setValue] = useLocalStorage('key', defaultValue);
 */

import { useState, useEffect } from 'react';

export function useLocalStorage(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return defaultValue;
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // quota exceeded or private browsing — fail silently
    }
  }, [key, state]);

  return [state, setState];
}
