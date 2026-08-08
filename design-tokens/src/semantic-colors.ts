/**
 * Taska Design Tokens — Semantic Colors
 *
 * Maps raw color scales to semantic meanings for light and dark modes.
 * These are the tokens consumed by components.
 */

import { color } from './colors';

export const semanticColor = {
  /**
   * Light mode (default)
   */
  light: {
    background: {
      primary: color.neutral[50],    // #F8FAFC — Main page background
      secondary: color.neutral[0],   // #FFFFFF — Card/surface background
      tertiary: color.neutral[100],  // #F1F5F9 — Subtle background
      inverse: color.neutral[900],   // #0F172A — Inverse background
    },
    surface: {
      primary: color.neutral[0],     // #FFFFFF — Primary surface
      secondary: color.neutral[50],  // #F8FAFC — Secondary surface
      tertiary: color.neutral[100],  // #F1F5F9 — Tertiary surface
      elevated: color.neutral[0],    // #FFFFFF — Elevated surface (cards, modals)
      inverse: color.neutral[900],   // #0F172A — Inverse surface
    },
    text: {
      primary: color.neutral[900],   // #0F172A — Primary text (#111827 mapped)
      secondary: color.neutral[500], // #6B7280 — Secondary text
      tertiary: color.neutral[400],  // #94A3B8 — Tertiary/muted text
      inverse: color.neutral[0],     // #FFFFFF — Inverse text
      disabled: color.neutral[300],  // #CBD5E1 — Disabled text
      link: color.primary.base,      // #2563EB — Link text
      linkHover: color.primary.hover, // #1D4ED8 — Link hover
    },
    border: {
      primary: color.neutral[200],   // #E2E8F0 — Default border
      secondary: color.neutral[300], // #CBD5E1 — Stronger border
      focus: color.primary.base,     // #2563EB — Focus ring
      error: color.error.base,       // #EF4444 — Error border
      success: color.success.base,   // #22C55E — Success border
      warning: color.warning.base,   // #F59E0B — Warning border
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
      backdrop: 'rgba(15, 23, 42, 0.5)',
      modal: 'rgba(15, 23, 42, 0.4)',
    },
    shadow: {
      sm: 'rgba(15, 23, 42, 0.04)',
      md: 'rgba(15, 23, 42, 0.06)',
      lg: 'rgba(15, 23, 42, 0.08)',
      xl: 'rgba(15, 23, 42, 0.12)',
    },
  },

  /**
   * Dark mode
   */
  dark: {
    background: {
      primary: color.neutral[900],   // #0F172A
      secondary: color.neutral[800], // #1E293B
      tertiary: color.neutral[700],  // #334155
      inverse: color.neutral[50],    // #F8FAFC
    },
    surface: {
      primary: color.neutral[800],   // #1E293B
      secondary: color.neutral[700], // #334155
      tertiary: color.neutral[600],  // #475569
      elevated: color.neutral[700],  // #334155
      inverse: color.neutral[50],    // #F8FAFC
    },
    text: {
      primary: color.neutral[0],     // #FFFFFF
      secondary: color.neutral[400], // #94A3B8
      tertiary: color.neutral[500],  // #6B7280
      inverse: color.neutral[900],   // #0F172A
      disabled: color.neutral[600],  // #475569
      link: color.primary[400],      // #60A5FA
      linkHover: color.neutral[200], // #E2E8F0
    },
    border: {
      primary: color.neutral[700],   // #334155
      secondary: color.neutral[600], // #475569
      focus: color.primary.base,     // #2563EB
      error: color.error.base,       // #EF4444
      success: color.success.base,   // #22C55E
      warning: color.warning.base,   // #F59E0B
    },
    primary: {
      primary: color.primary[400],   // #60A5FA
      primaryHover: color.primary[300],
      primaryActive: color.primary[200],
      primaryLight: color.neutral[800],
      primaryLightHover: color.neutral[700],
      onPrimary: color.neutral[900],
    },
    success: {
      primary: color.success.base,
      primaryHover: color.success.hover,
      primaryActive: color.success.active,
      light: color.success.light,
      lightHover: color.success.lightHover,
      onSuccess: color.neutral[900],
    },
    warning: {
      primary: color.warning.base,
      primaryHover: color.warning.hover,
      primaryActive: color.warning.active,
      light: color.warning.light,
      lightHover: color.warning.lightHover,
      onWarning: color.neutral[900],
    },
    error: {
      primary: color.error.base,
      primaryHover: color.error.hover,
      primaryActive: color.error.active,
      light: color.error.light,
      lightHover: color.error.lightHover,
      onError: color.neutral[900],
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
