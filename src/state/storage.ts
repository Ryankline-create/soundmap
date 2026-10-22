import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

export const KEYS = {
  player: 'soundmap.player.v1',
  learn: 'soundmap.learn.v1',
  deck: 'soundmap.deck.v1',
} as const;

export async function loadJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

export async function clearAll() {
  await AsyncStorage.multiRemove(Object.values(KEYS)).catch(() => {});
}

// State that loads once from storage, then saves (debounced) on every change.
export function usePersisted<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    loadJSON<T>(key).then((saved) => {
      if (!alive) return;
      if (saved) setState({ ...initial, ...saved });
      setReady(true);
    });
    return () => {
      alive = false;
    };
    // initial is a constant default; loading runs once per key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveJSON(key, state), 250);
  }, [key, state, ready]);

  return [state, setState, ready] as const;
}

export const dayKey = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const DAY = 24 * 60 * 60 * 1000;
