/**
 * Taska Design Tokens — Colors
 *
 * Design Style: Modern, Minimal, Human-centered, Premium, Clean, Professional
 * Inspiration: Uber, Airbnb, Notion, Linear, Google Material 3
 */

export const color = {
  /**
   * Primary — #2563EB (Blue)
   * Used for: CTAs, links, active states, key interactive elements
   */
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    base: '#2563EB',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    hover: '#1D4ED8',
    active: '#1E40AF',
    light: '#EFF6FF',
    lightHover: '#DBEAFE',
    onLight: '#1E40AF',
  },

  /**
   * Success — #22C55E (Green)
   * Used for: Confirmations, positive states, completed actions
   */
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    base: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    hover: '#16A34A',
    active: '#15803D',
    light: '#F0FDF4',
    lightHover: '#DCFCE7',
    onSuccess: '#FFFFFF',
  },

  /**
   * Warning — #F59E0B (Amber)
   * Used for: Caution states, pending actions, alerts
   */
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    base: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    hover: '#D97706',
    active: '#B45309',
    light: '#FFFBEB',
    lightHover: '#FEF3C7',
    onWarning: '#78350F',
  },

  /**
   * Error — #EF4444 (Red)
   * Used for: Errors, destructive actions, critical alerts
   */
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    base: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    hover: '#DC2626',
    active: '#B91C1C',
    light: '#FEF2F2',
    lightHover: '#FEE2E2',
    onError: '#FFFFFF',
  },

  /**
   * Neutral — Slate scale
   * Used for: Text, backgrounds, borders, disabled states
   */
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#6B7280',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
} as const;

export type ColorScale = keyof typeof color.primary;
export type ColorName = keyof typeof color;
