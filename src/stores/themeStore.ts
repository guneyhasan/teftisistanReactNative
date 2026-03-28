import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS_LIGHT, COLORS_DARK } from '@src/configs/theme';
import { THEME_STORAGE_KEY } from '@src/configs/constants';

export type ColorScheme = 'light' | 'dark';

type Colors = Record<keyof typeof COLORS_LIGHT, string>;

interface ThemeState {
  colorScheme: ColorScheme;
  colors: Colors;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  loadStoredTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  colorScheme: 'light',
  colors: COLORS_LIGHT,

  setColorScheme: async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      set({
        colorScheme: scheme,
        colors: scheme === 'dark' ? COLORS_DARK : COLORS_LIGHT,
      });
    } catch {
      // Fallback to in-memory only
      set({
        colorScheme: scheme,
        colors: scheme === 'dark' ? COLORS_DARK : COLORS_LIGHT,
      });
    }
  },

  loadStoredTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const scheme: ColorScheme = stored === 'dark' ? 'dark' : 'light';
      set({
        colorScheme: scheme,
        colors: scheme === 'dark' ? COLORS_DARK : COLORS_LIGHT,
      });
    } catch {
      set({ colorScheme: 'light', colors: COLORS_LIGHT });
    }
  },
}));
