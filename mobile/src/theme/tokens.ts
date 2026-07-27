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

/**
 * Taska Design System — Light color palette.
 * @see design-tokens/src/semantic-colors.ts for the complete token source.
 */
export const lightColors: ThemeColors = {
  background: '#F8FAFC',      /* neutral.50 */
  surface: '#FFFFFF',          /* neutral.0 */
  primary: '#2563EB',          /* primary.600 */
  primaryVariant: '#1D4ED8',   /* primary.700 */
  success: '#22C55E',          /* success.500 */
  warning: '#F59E0B',          /* warning.500 */
  error: '#EF4444',            /* error.500 */
  textPrimary: '#111827',      /* neutral.900 */
  textSecondary: '#6B7280',    /* neutral.500 */
  border: '#E5E7EB',           /* neutral.200 */
  overlay: 'rgba(17, 24, 39, 0.5)', /* neutral.900 @ 50% */
};

export const darkColors: ThemeColors = {
  background: '#030712',       /* neutral.950 */
  surface: '#1F2937',          /* neutral.800 */
  primary: '#60A5FA',          /* primary.400 */
  primaryVariant: '#93C5FD',   /* primary.300 */
  success: '#4ADE80',          /* success.400 */
  warning: '#FBBF24',          /* warning.400 */
  error: '#F87171',            /* error.400 */
  textPrimary: '#F9FAFB',      /* neutral.50 */
  textSecondary: '#9CA3AF',    /* neutral.400 */
  border: '#374151',           /* neutral.700 */
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
