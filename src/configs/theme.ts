import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS_LIGHT = {
  primary: '#10b981',
  primaryDark: '#059669',
  primaryLight: '#d1fae5',
  secondary: '#6366f1',
  secondaryLight: '#e0e7ff',

  success: '#22c55e',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  text: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textInverse: '#ffffff',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  overlay: 'rgba(0,0,0,0.5)',
} as const;

export const COLORS_DARK = {
  primary: '#10b981',
  primaryDark: '#059669',
  primaryLight: '#064e3b',
  secondary: '#818cf8',
  secondaryLight: '#312e81',

  success: '#22c55e',
  successLight: '#14532d',
  warning: '#f59e0b',
  warningLight: '#78350f',
  danger: '#ef4444',
  dangerLight: '#7f1d1d',
  info: '#3b82f6',
  infoLight: '#1e3a8a',

  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  border: '#475569',
  borderLight: '#334155',

  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  textInverse: '#0f172a',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  overlay: 'rgba(0,0,0,0.7)',
} as const;

/** @deprecated Use useTheme().colors instead */
export const COLORS = COLORS_LIGHT;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  title: 34,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

export const SCREEN = {
  width,
  height,
} as const;
