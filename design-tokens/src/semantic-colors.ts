import { color } from './colors';

export const semanticColor = {
  light: {
    background: {
      primary: color.neutral[50],
      secondary: color.neutral[0],
      tertiary: color.neutral[100],
      inverse: color.neutral[900],
    },
    surface: {
      primary: color.neutral[0],
      secondary: color.neutral[50],
      tertiary: color.neutral[100],
      elevated: color.neutral[0],
      inverse: color.neutral[900],
    },
    text: {
      primary: color.neutral[900],
      secondary: color.neutral[500],
      tertiary: color.neutral[400],
      inverse: color.neutral[0],
      disabled: color.neutral[400],
      link: color.primary[600],
      linkHover: color.primary[700],
    },
    border: {
      primary: color.neutral[200],
      secondary: color.neutral[300],
      focus: color.primary[600],
      error: color.error[500],
      success: color.success[500],
      warning: color.warning[500],
    },
    primary: {
      primary: color.primary[600],
      primaryHover: color.primary[700],
      primaryActive: color.primary[800],
      primaryLight: color.primary[50],
      primaryLightHover: color.primary[100],
      onPrimary: color.neutral[0],
    },
    success: {
      primary: color.success[500],
      primaryHover: color.success[600],
      primaryActive: color.success[700],
      light: color.success[50],
      lightHover: color.success[100],
      onSuccess: color.neutral[0],
    },
    warning: {
      primary: color.warning[500],
      primaryHover: color.warning[600],
      primaryActive: color.warning[700],
      light: color.warning[50],
      lightHover: color.warning[100],
      onWarning: color.neutral[900],
    },
    error: {
      primary: color.error[500],
      primaryHover: color.error[600],
      primaryActive: color.error[700],
      light: color.error[50],
      lightHover: color.error[100],
      onError: color.neutral[0],
    },
    overlay: {
      backdrop: 'rgba(17, 24, 39, 0.5)',
      modal: 'rgba(17, 24, 39, 0.4)',
    },
    shadow: {
      sm: 'rgba(17, 24, 39, 0.05)',
      md: 'rgba(17, 24, 39, 0.1)',
      lg: 'rgba(17, 24, 39, 0.15)',
      xl: 'rgba(17, 24, 39, 0.2)',
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
      primary: color.neutral[50],
      secondary: color.neutral[400],
      tertiary: color.neutral[500],
      inverse: color.neutral[900],
      disabled: color.neutral[600],
      link: color.primary[400],
      linkHover: color.primary[300],
    },
    border: {
      primary: color.neutral[700],
      secondary: color.neutral[600],
      focus: color.primary[400],
      error: color.error[400],
      success: color.success[400],
      warning: color.warning[400],
    },
    primary: {
      primary: color.primary[500],
      primaryHover: color.primary[400],
      primaryActive: color.primary[300],
      primaryLight: color.primary[900],
      primaryLightHover: color.primary[800],
      onPrimary: color.neutral[950],
    },
    success: {
      primary: color.success[400],
      primaryHover: color.success[300],
      primaryActive: color.success[200],
      light: color.success[900],
      lightHover: color.success[800],
      onSuccess: color.neutral[950],
    },
    warning: {
      primary: color.warning[400],
      primaryHover: color.warning[300],
      primaryActive: color.warning[200],
      light: color.warning[900],
      lightHover: color.warning[800],
      onWarning: color.neutral[950],
    },
    error: {
      primary: color.error[400],
      primaryHover: color.error[300],
      primaryActive: color.error[200],
      light: color.error[900],
      lightHover: color.error[800],
      onError: color.neutral[950],
    },
    overlay: {
      backdrop: 'rgba(0, 0, 0, 0.7)',
      modal: 'rgba(0, 0, 0, 0.5)',
    },
    shadow: {
      sm: 'rgba(0, 0, 0, 0.2)',
      md: 'rgba(0, 0, 0, 0.3)',
      lg: 'rgba(0, 0, 0, 0.4)',
      xl: 'rgba(0, 0, 0, 0.5)',
    },
  },
} as const;

export type SemanticColorLight = typeof semanticColor.light;
export type SemanticColorDark = typeof semanticColor.dark;
export type SemanticColorMode = 'light' | 'dark';
export type SemanticColor = SemanticColorLight | SemanticColorDark;