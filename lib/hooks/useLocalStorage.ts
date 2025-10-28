import { useState, useEffect } from 'react';

// Custom hook for safe localStorage access that prevents hydration mismatches
export function useLocalStorage(key: string, defaultValue: string | null = null): [string | null, (value: string | null) => void] {
  const [value, setValue] = useState<string | null>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only access localStorage after hydration
    setIsHydrated(true);
    const stored = localStorage.getItem(key);
    setValue(stored);
  }, [key]);

  const setStoredValue = (newValue: string | null) => {
    setValue(newValue);
    if (isHydrated) {
      if (newValue === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, newValue);
      }
    }
  };

  return [isHydrated ? value : defaultValue, setStoredValue];
}

// Hook for checking if component is hydrated (client-side)
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
