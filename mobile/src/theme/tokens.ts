/**
 * Taska Mobile Theme Tokens
 *
 * Single source of truth for all design tokens in the mobile app.
 * Matches the design-tokens package for consistency.
 *
 * Design Style: Modern, Minimal, Human-centered, Premium, Clean, Professional
 * Inspiration: Uber, Airbnb, Notion, Linear, Google Material 3
 */

import {
  Theme,
  ThemeTokens,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeShapes,
  ThemeShadow,
  ThemeElevation,
  ThemeAnimation,
  ThemeOpacity,
  ThemeZIndex,
  ThemeButtonSizes,
  ThemeInputSizes,
  ThemeIconSize,
} from './types';

// ─── Colors ────────────────────────────────────────────────────────────────

export const lightColors: ThemeColors = {
  // Backgrounds
  background: '#F8FAFC',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F1F5F9',

  // Surfaces
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceElevated: '#FFFFFF',

  // Primary — Blue #2563EB
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryVariant: '#1D4ED8',
  primaryActive: '#1E40AF',
  primaryLight: '#EFF6FF',
  primaryLightHover: '#DBEAFE',
  onPrimary: '#FFFFFF',

  // Success — Green #22C55E
  success: '#22C55E',
  successHover: '#16A34A',
  successLight: '#F0FDF4',
  onSuccess: '#FFFFFF',

  // Warning — Amber #F59E0B
  warning: '#F59E0B',
  warningHover: '#D97706',
  warningLight: '#FFFBEB',
  onWarning: '#78350F',

  // Error — Red #EF4444
  error: '#EF4444',
  errorHover: '#DC2626',
  errorLight: '#FEF2F2',
  onError: '#FFFFFF',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#6B7280',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textDisabled: '#CBD5E1',
  textLink: '#2563EB',
  textLinkHover: '#1D4ED8',

  // Borders
  border: '#E2E8F0',
  borderSecondary: '#CBD5E1',
  borderFocus: '#2563EB',
  borderError: '#EF4444',
  borderSuccess: '#22C55E',
  borderWarning: '#F59E0B',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayModal: 'rgba(15, 23, 42, 0.4)',

  // Shadow
  shadowSm: 'rgba(15, 23, 42, 0.04)',
  shadowMd: 'rgba(15, 23, 42, 0.06)',
  shadowLg: 'rgba(15, 23, 42, 0.08)',
  shadowXl: 'rgba(15, 23, 42, 0.12)',
};

export const darkColors: ThemeColors = {
  // Backgrounds
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',

  // Surfaces
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  surfaceElevated: '#334155',

  // Primary — Blue (lighter for dark mode)
  primary: '#60A5FA',
  primaryHover: '#93C5FD',
  primaryVariant: '#93C5FD',
  primaryActive: '#BFDBFE',
  primaryLight: '#1E293B',
  primaryLightHover: '#334155',
  onPrimary: '#0F172A',

  // Success — Green
  success: '#22C55E',
  successHover: '#4ADE80',
  successLight: '#14532D',
  onSuccess: '#FFFFFF',

  // Warning — Amber
  warning: '#F59E0B',
  warningHover: '#FBBF24',
  warningLight: '#78350F',
  onWarning: '#FFFFFF',

  // Error — Red
  error: '#EF4444',
  errorHover: '#F87171',
  errorLight: '#7F1D1D',
  onError: '#FFFFFF',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#6B7280',
  textInverse: '#0F172A',
  textDisabled: '#475569',
  textLink: '#60A5FA',
  textLinkHover: '#E2E8F0',

  // Borders
  border: '#334155',
  borderSecondary: '#475569',
  borderFocus: '#2563EB',
  borderError: '#EF4444',
  borderSuccess: '#22C55E',
  borderWarning: '#F59E0B',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayModal: 'rgba(0, 0, 0, 0.5)',

  // Shadow
  shadowSm: 'rgba(255, 255, 255, 0.04)',
  shadowMd: 'rgba(255, 255, 255, 0.06)',
  shadowLg: 'rgba(255, 255, 255, 0.08)',
  shadowXl: 'rgba(255, 255, 255, 0.12)',
};

// ─── Spacing ───────────────────────────────────────────────────────────────

export const spacing: ThemeSpacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,

  xxl: 48,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,

  screenPadding: 24,
};

// ─── Typography ────────────────────────────────────────────────────────────

export const typography: ThemeTypography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
    mono: 'JetBrains Mono, Fira Code, SF Mono, Consolas, Monaco, monospace',
  },

  fontSize: {
    // Display (hero/marketing)
    'display-2xl': 72,
    'display-xl': 60,
    'display-lg': 48,
    'display-md': 36,
    'display-sm': 30,
    'display-xs': 24,

    // Headings
    h1: 30,
    h2: 24,
    h3: 20,
    h4: 18,
    h5: 16,
    h6: 14,

    // Body
    'body-xl': 20,
    'body-lg': 18,
    'body-md': 16,
    'body-sm': 14,
    'body-xs': 12,

    // Labels
    'label-lg': 16,
    'label-md': 14,
    'label-sm': 12,
    'label-xs': 11,

    // Legacy (backward compatibility)
    display: 48,
    headline: 32,
    title: 24,
    subtitle: 18,
    body: 16,
    caption: 12,
    button: 14,
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeight: {
    none: 1,
    tight: 1.15,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// ─── Shapes ────────────────────────────────────────────────────────────────

export const shapes: ThemeShapes = {
  borderRadius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 20,
    '4xl': 24,
    full: 9999,
  },

  card: 8,
  button: 8,
  input: 8,
  badge: 9999,
  modal: 12,
  sheet: 16,
  avatar: 9999,
  tag: 6,
};

// ─── Shadows ───────────────────────────────────────────────────────────────

export const shadow: ThemeShadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 16,
  },
  '2xl': {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
};

// ─── Elevation ─────────────────────────────────────────────────────────────

export const elevation: ThemeElevation = {
  none: 0,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};

// ─── Animation ─────────────────────────────────────────────────────────────

export const animation: ThemeAnimation = {
  duration: {
    instant: 0,
    fastest: 50,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 400,
    slowest: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

// ─── Opacity ───────────────────────────────────────────────────────────────

export const opacity: ThemeOpacity = {
  transparent: 0,
  disabled: 0.4,
  pressed: 0.8,
  hover: 0.9,
  skeleton: 0.6,
  overlay: 0.5,
};

// ─── Z-Index ───────────────────────────────────────────────────────────────

export const zIndex: ThemeZIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  toast: 1070,
  tooltip: 1080,
};

// ─── Button Sizes ──────────────────────────────────────────────────────────

export const buttonSizes: ThemeButtonSizes = {
  sm: {
    height: 36,
    minWidth: 48,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: '500',
    iconSize: 16,
    iconGap: 4,
    borderRadius: 8,
  },
  md: {
    height: 44,
    minWidth: 80,
    paddingHorizontal: 20,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: '500',
    iconSize: 20,
    iconGap: 8,
    borderRadius: 8,
  },
  lg: {
    height: 52,
    minWidth: 96,
    paddingHorizontal: 28,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: '500',
    iconSize: 24,
    iconGap: 8,
    borderRadius: 10,
  },
  xl: {
    height: 56,
    minWidth: 120,
    paddingHorizontal: 32,
    paddingVertical: 14,
    fontSize: 18,
    lineHeight: 1.5,
    fontWeight: '500',
    iconSize: 24,
    iconGap: 10,
    borderRadius: 12,
  },
};

// ─── Input Sizes ───────────────────────────────────────────────────────────

export const inputSizes: ThemeInputSizes = {
  sm: {
    height: 36,
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    lineHeight: 1.5,
    iconSize: 16,
    borderRadius: 8,
    labelFontSize: 12,
    helperFontSize: 11,
    gap: 4,
  },
  md: {
    height: 44,
    minWidth: 160,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 1.5,
    iconSize: 20,
    borderRadius: 8,
    labelFontSize: 14,
    helperFontSize: 12,
    gap: 6,
  },
  lg: {
    height: 52,
    minWidth: 200,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 1.5,
    iconSize: 24,
    borderRadius: 10,
    labelFontSize: 14,
    helperFontSize: 12,
    gap: 8,
  },
};

// ─── Icon Sizes ────────────────────────────────────────────────────────────

export const iconSizes: ThemeIconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

// ─── Theme Definitions ─────────────────────────────────────────────────────

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  typography,
  shapes,
  shadow,
  elevation,
  animation,
  opacity,
  zIndex,
  buttonSizes,
  inputSizes,
  iconSizes,
  isDark: false,
  mode: 'light',
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  typography,
  shapes,
  shadow,
  elevation,
  animation,
  opacity,
  zIndex,
  buttonSizes,
  inputSizes,
  iconSizes,
  isDark: true,
  mode: 'dark',
};

export const themeTokens: ThemeTokens = {
  light: lightTheme,
  dark: darkTheme,
};
