import { TextStyle } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  primaryVariant: string;
  success: string;
  warning: string;
  error: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  overlay: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  screenPadding: number;
}

export interface ThemeTypography {
  fontSize: {
    display: number;
    headline: number;
    title: number;
    subtitle: number;
    body: number;
    caption: number;
    button: number;
  };
  fontWeight: {
    regular: TextStyle['fontWeight'];
    medium: TextStyle['fontWeight'];
    semibold: TextStyle['fontWeight'];
    bold: TextStyle['fontWeight'];
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeShapes {
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  full: number;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shapes: ThemeShapes;
  isDark: boolean;
  mode: 'light' | 'dark';
}

export interface ThemeTokens {
  light: Theme;
  dark: Theme;
}