import {
  Theme,
  ThemeTokens,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeShapes,
} from './types';

export const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPadding: 24,
};

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  primary: '#4F46E5',
  primaryVariant: '#4338CA',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#818CF8',
  primaryVariant: '#6366F1',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const typography: ThemeTypography = {
  fontSize: {
    display: 48,
    h1: 32,
    h2: 24,
    body: 16,
    caption: 12,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shapes: ThemeShapes = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
};

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  typography,
  shapes,
  isDark: false,
  mode: 'light',
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  typography,
  shapes,
  isDark: true,
  mode: 'dark',
};

export const themeTokens: ThemeTokens = {
  light: lightTheme,
  dark: darkTheme,
};
