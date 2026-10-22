import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { dark, light, regionInkKey, type Colors } from './tokens';
import type { RegionKey } from '@/src/data/types';

export type ThemeMode = 'system' | 'light' | 'dark';

type Theme = {
  c: Colors;
  scheme: 'light' | 'dark';
  ink: (region: RegionKey) => string;
};

const ThemeContext = createContext<Theme>({
  c: light,
  scheme: 'light',
  ink: (r) => light[regionInkKey[r]],
});

export function ThemeProvider({ mode, children }: { mode: ThemeMode; children: ReactNode }) {
  const system = useColorScheme();
  const scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<Theme>(() => {
    const c = scheme === 'dark' ? dark : light;
    return { c, scheme, ink: (r) => c[regionInkKey[r]] };
  }, [scheme]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(value.c.bg).catch(() => {});
  }, [value.c.bg]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
