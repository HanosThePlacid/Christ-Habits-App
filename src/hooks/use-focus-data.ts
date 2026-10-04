import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/** Loads data when the screen gains focus; `reload` refetches after a write. */
export function useFocusData<T>(load: () => Promise<T>): {
  data: T | undefined;
  reload: () => void;
} {
  const [data, setData] = useState<T>();
  const reload = useCallback(() => {
    load().then(setData);
  }, [load]);
  useFocusEffect(reload);
  return { data, reload };
}
