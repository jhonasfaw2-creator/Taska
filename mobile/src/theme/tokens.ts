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
  background: '#F6F6F6',
  surface: '#FFFFFF',
  primary: '#000000',
  primaryVariant: '#1F1F1F',
  success: '#05A357',
  warning: '#FFC043',
  error: '#E11900',
  textPrimary: '#000000',
  textSecondary: '#545454',
  border: '#E2E2E2',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#1A1A1A',
  primary: '#F3F3F3',
  primaryVariant: '#CCCCCC',
  success: '#05A357',
  warning: '#FFC043',
  error: '#E11900',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: '#2A2A2A',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const typography: ThemeTypography = {
  fontSize: {
    display: 72,
    headline: 32,
    title: 24,
    subtitle: 18,
    body: 16,
    caption: 12,
    button: 16,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.625,
  },
};

export const shapes: ThemeShapes = {
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
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