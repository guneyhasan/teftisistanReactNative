import React, { createContext, useContext, useMemo } from 'react';
import { useThemeStore } from '@src/stores/themeStore';
import type { ColorScheme } from '@src/stores/themeStore';
import { COLORS_LIGHT } from '@src/configs/theme';

type Colors = Record<keyof typeof COLORS_LIGHT, string>;

interface ThemeContextValue {
  colors: Colors;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const colors = useThemeStore((s) => s.colors);
  const setColorScheme = useThemeStore((s) => s.setColorScheme);

  const value = useMemo<ThemeContextValue>(
    () => ({ colors, colorScheme, setColorScheme }),
    [colors, colorScheme, setColorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
