/**
 * Taska Mobile Theme Types
 *
 * Matches the design-tokens package for consistency.
 * Modern, minimal, human-centered design system.
 */

import { TextStyle, ViewStyle } from 'react-native';

// ─── Colors ────────────────────────────────────────────────────────────────

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Surfaces
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;

  // Primary (Blue #2563EB)
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryLight: string;
  primaryLightHover: string;
  onPrimary: string;
  primaryVariant: string; // Legacy alias for primaryHover

  // Success (Green #22C55E)
  success: string;
  successHover: string;
  successLight: string;
  onSuccess: string;

  // Warning (Amber #F59E0B)
  warning: string;
  warningHover: string;
  warningLight: string;
  onWarning: string;

  // Error (Red #EF4444)
  error: string;
  errorHover: string;
  errorLight: string;
  onError: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textDisabled: string;
  textLink: string;
  textLinkHover: string;

  // Borders
  border: string;
  borderSecondary: string;
  borderFocus: string;
  borderError: string;
  borderSuccess: string;
  borderWarning: string;

  // Overlay
  overlay: string;
  overlayModal: string;

  // Shadow
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
}

// ─── Spacing ───────────────────────────────────────────────────────────────

export interface ThemeSpacing {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
  10: number;
  12: number;
  14: number;
  16: number;
  20: number;
  24: number;

  // Semantic aliases
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number; // Legacy alias for 2xl
  '2xl': number;
  '3xl': number;
  '4xl': number;

  // Screen padding
  screenPadding: number;
}

// ─── Typography ────────────────────────────────────────────────────────────

export interface ThemeTypography {
  fontFamily: {
    sans: string;
    mono: string;
  };

  fontSize: {
    // Display (hero/marketing)
    'display-2xl': number;
    'display-xl': number;
    'display-lg': number;
    'display-md': number;
    'display-sm': number;
    'display-xs': number;

    // Headings
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;

    // Body
    'body-xl': number;
    'body-lg': number;
    'body-md': number;
    'body-sm': number;
    'body-xs': number;

    // Labels
    'label-lg': number;
    'label-md': number;
    'label-sm': number;
    'label-xs': number;

    // Legacy (backward compatibility)
    display: number;
    headline: number;
    title: number;
    subtitle: number;
    body: number;
    caption: number;
    button: number;
  };

  fontWeight: {
    thin: TextStyle['fontWeight'];
    extralight: TextStyle['fontWeight'];
    light: TextStyle['fontWeight'];
    regular: TextStyle['fontWeight'];
    medium: TextStyle['fontWeight'];
    semibold: TextStyle['fontWeight'];
    bold: TextStyle['fontWeight'];
    extrabold: TextStyle['fontWeight'];
    black: TextStyle['fontWeight'];
  };

  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

// ─── Shapes ────────────────────────────────────────────────────────────────

export interface ThemeShapes {
  borderRadius: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    full: number;
  };

  // Semantic border radius
  card: number;
  button: number;
  input: number;
  badge: number;
  modal: number;
  sheet: number;
  avatar: number;
  tag: number;
}

// ─── Shadows ───────────────────────────────────────────────────────────────

export interface ThemeShadow {
  none: ViewStyle;
  xs: ViewStyle;
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  xl: ViewStyle;
  '2xl': ViewStyle;
}

// ─── Elevation ─────────────────────────────────────────────────────────────

export interface ThemeElevation {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

// ─── Animation ─────────────────────────────────────────────────────────────

export interface ThemeAnimation {
  duration: {
    instant: number;
    fastest: number;
    fast: number;
    normal: number;
    slow: number;
    slower: number;
    slowest: number;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    emphasized: string;
    spring: string;
  };
}

// ─── Opacity ───────────────────────────────────────────────────────────────

export interface ThemeOpacity {
  transparent: number;
  disabled: number;
  pressed: number;
  hover: number;
  skeleton: number;
  overlay: number;
}

// ─── Z-Index ───────────────────────────────────────────────────────────────

export interface ThemeZIndex {
  hide: number;
  base: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  toast: number;
  tooltip: number;
}

// ─── Button Sizes ──────────────────────────────────────────────────────────

export interface ThemeButtonSize {
  height: number;
  minWidth: number;
  paddingHorizontal: number;
  paddingVertical: number;
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  iconSize: number;
  iconGap: number;
  borderRadius: number;
}

export interface ThemeButtonSizes {
  sm: ThemeButtonSize;
  md: ThemeButtonSize;
  lg: ThemeButtonSize;
  xl: ThemeButtonSize;
}

// ─── Input Sizes ───────────────────────────────────────────────────────────

export interface ThemeInputSize {
  height: number;
  minWidth: number;
  paddingHorizontal: number;
  paddingVertical: number;
  fontSize: number;
  lineHeight: number;
  iconSize: number;
  borderRadius: number;
  labelFontSize: number;
  helperFontSize: number;
  gap: number;
}

export interface ThemeInputSizes {
  sm: ThemeInputSize;
  md: ThemeInputSize;
  lg: ThemeInputSize;
}

// ─── Icon Sizes ────────────────────────────────────────────────────────────

export interface ThemeIconSize {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
}

// ─── Main Theme ────────────────────────────────────────────────────────────

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shapes: ThemeShapes;
  shadow: ThemeShadow;
  elevation: ThemeElevation;
  animation: ThemeAnimation;
  opacity: ThemeOpacity;
  zIndex: ThemeZIndex;
  buttonSizes: ThemeButtonSizes;
  inputSizes: ThemeInputSizes;
  iconSizes: ThemeIconSize;
  isDark: boolean;
  mode: 'light' | 'dark';
}

export interface ThemeTokens {
  light: Theme;
  dark: Theme;
}
