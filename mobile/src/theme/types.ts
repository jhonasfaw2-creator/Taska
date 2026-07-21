import { TextStyle } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  primaryVariant: string;
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
    h1: number;
    h2: number;
    body: number;
    caption: number;
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
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
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
