import { useState } from "react";

export const useLocalStorageState = <T>(
  storageKey: string,
  initialValue: T
) => {
  const [state, setState] = useState<T>(() => {
    try {
      const stateFromStorage = JSON.parse(
        localStorage.getItem(storageKey) as string
      );
      if (stateFromStorage) {
        return stateFromStorage;
      } else {
        return initialValue;
      }
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const handleStateChange = (v: T | ((val: T) => T)) => {
    try {
      const resolvedValue = v instanceof Function ? v(state) : v;

      setState(resolvedValue);
      window.localStorage.setItem(storageKey, JSON.stringify(resolvedValue));
    } catch (error) {
      console.error(error);
    }
  };

  return [state, handleStateChange] as const;
};
