import { color } from './colors';

export const semanticColor = {
  light: {
    background: {
      primary: color.neutral[50],
      secondary: color.neutral[0],
      tertiary: color.neutral[100],
      inverse: color.neutral[950],
    },
    surface: {
      primary: color.neutral[0],
      secondary: color.neutral[50],
      tertiary: color.neutral[100],
      elevated: color.neutral[0],
      inverse: color.neutral[950],
    },
    text: {
      primary: color.neutral[950],
      secondary: color.neutral[500],
      tertiary: color.neutral[400],
      inverse: color.neutral[0],
      disabled: color.neutral[300],
      link: color.primary.base,
      linkHover: color.primary.hover,
    },
    border: {
      primary: color.neutral[200],
      secondary: color.neutral[300],
      focus: color.primary.base,
      error: color.error.base,
      success: color.success.base,
      warning: color.warning.base,
    },
    primary: {
      primary: color.primary.base,
      primaryHover: color.primary.hover,
      primaryActive: color.primary.active,
      primaryLight: color.primary.light,
      primaryLightHover: color.primary.lightHover,
      onPrimary: color.neutral[0],
    },
    success: {
      primary: color.success.base,
      primaryHover: color.success.hover,
      primaryActive: color.success.active,
      light: color.success.light,
      lightHover: color.success.lightHover,
      onSuccess: color.success.onSuccess,
    },
    warning: {
      primary: color.warning.base,
      primaryHover: color.warning.hover,
      primaryActive: color.warning.active,
      light: color.warning.light,
      lightHover: color.warning.lightHover,
      onWarning: color.warning.onWarning,
    },
    error: {
      primary: color.error.base,
      primaryHover: color.error.hover,
      primaryActive: color.error.active,
      light: color.error.light,
      lightHover: color.error.lightHover,
      onError: color.error.onError,
    },
    overlay: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      modal: 'rgba(0, 0, 0, 0.4)',
    },
    shadow: {
      sm: 'rgba(0, 0, 0, 0.04)',
      md: 'rgba(0, 0, 0, 0.06)',
      lg: 'rgba(0, 0, 0, 0.08)',
      xl: 'rgba(0, 0, 0, 0.12)',
    },
  },
  dark: {
    background: {
      primary: color.neutral[950],
      secondary: color.neutral[900],
      tertiary: color.neutral[800],
      inverse: color.neutral[50],
    },
    surface: {
      primary: color.neutral[900],
      secondary: color.neutral[800],
      tertiary: color.neutral[700],
      elevated: color.neutral[800],
      inverse: color.neutral[50],
    },
    text: {
      primary: color.neutral[0],
      secondary: color.neutral[400],
      tertiary: color.neutral[500],
      inverse: color.neutral[950],
      disabled: color.neutral[600],
      link: color.primary.light,
      linkHover: color.neutral[300],
    },
    border: {
      primary: color.neutral[700],
      secondary: color.neutral[600],
      focus: color.primary.base,
      error: color.error.base,
      success: color.success.base,
      warning: color.warning.base,
    },
    primary: {
      primary: color.primary.light,
      primaryHover: color.neutral[300],
      primaryActive: color.neutral[200],
      primaryLight: color.neutral[900],
      primaryLightHover: color.neutral[800],
      onPrimary: color.neutral[950],
    },
    success: {
      primary: color.success.base,
      primaryHover: color.success.hover,
      primaryActive: color.success.active,
      light: color.success.light,
      lightHover: color.success.lightHover,
      onSuccess: color.neutral[950],
    },
    warning: {
      primary: color.warning.base,
      primaryHover: color.warning.hover,
      primaryActive: color.warning.active,
      light: color.warning.light,
      lightHover: color.warning.lightHover,
      onWarning: color.neutral[950],
    },
    error: {
      primary: color.error.base,
      primaryHover: color.error.hover,
      primaryActive: color.error.active,
      light: color.error.light,
      lightHover: color.error.lightHover,
      onError: color.neutral[950],
    },
    overlay: {
      backdrop: 'rgba(0, 0, 0, 0.7)',
      modal: 'rgba(0, 0, 0, 0.5)',
    },
    shadow: {
      sm: 'rgba(255, 255, 255, 0.04)',
      md: 'rgba(255, 255, 255, 0.06)',
      lg: 'rgba(255, 255, 255, 0.08)',
      xl: 'rgba(255, 255, 255, 0.12)',
    },
  },
} as const;

export type SemanticColorLight = typeof semanticColor.light;
export type SemanticColorDark = typeof semanticColor.dark;
export type SemanticColorMode = 'light' | 'dark';
export type SemanticColor = SemanticColorLight | SemanticColorDark;