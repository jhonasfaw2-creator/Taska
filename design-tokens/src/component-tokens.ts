/**
 * Taska Design Tokens — Component Tokens
 *
 * Pre-composed tokens for common UI components
 */

import { borderRadius, borderRadiusSemantic } from './border-radius';
import { buttonSize, iconButtonSize } from './button-sizes';
import { inputSize, textareaSize, selectSize, checkboxSize, switchSize } from './input-sizes';
import { spacing, spacingSemantic } from './spacing';
import { shadow } from './shadows';
import { iconSize } from './icon-sizes';

// ─── Card ──────────────────────────────────────────────────────────────────

export const cardTokens = {
  padding: {
    sm: spacingSemantic.sm,
    md: spacingSemantic.md,
    lg: spacingSemantic.lg,
    xl: spacingSemantic.xl,
  },
  borderRadius: borderRadiusSemantic.card,
  shadow: shadow.xs,
  shadowHover: shadow.sm,
  borderWidth: 1,
  gap: spacingSemantic.md,
} as const;

// ─── Button ────────────────────────────────────────────────────────────────

export const buttonTokens = {
  sizes: buttonSize,
  iconSizes: iconButtonSize,
  borderRadius: borderRadiusSemantic.button,
  focusRing: {
    width: 2,
    offset: 2,
    style: 'solid' as const,
  },
  transition: {
    duration: '150ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ─── Input ─────────────────────────────────────────────────────────────────

export const inputTokens = {
  sizes: inputSize,
  textareaSizes: textareaSize,
  selectSizes: selectSize,
  checkboxSizes: checkboxSize,
  switchSizes: switchSize,
  borderRadius: borderRadiusSemantic.input,
  borderWidth: 1,
  focusRing: {
    width: 2,
    offset: 2,
    style: 'solid' as const,
  },
  transition: {
    duration: '150ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ─── Avatar ────────────────────────────────────────────────────────────────

export const avatarTokens = {
  sizes: {
    xs: { size: 24, fontSize: 10, iconSize: iconSize.xs },
    sm: { size: 32, fontSize: 12, iconSize: iconSize.sm },
    md: { size: 40, fontSize: 14, iconSize: iconSize.md },
    lg: { size: 48, fontSize: 16, iconSize: iconSize.lg },
    xl: { size: 64, fontSize: 20, iconSize: iconSize.xl },
  },
  borderRadius: borderRadius.full,
  borderWidth: 2,
} as const;

// ─── Badge ─────────────────────────────────────────────────────────────────

export const badgeTokens = {
  sizes: {
    sm: { height: 20, paddingHorizontal: 6, fontSize: 11 },
    md: { height: 24, paddingHorizontal: 8, fontSize: 12 },
    lg: { height: 28, paddingHorizontal: 10, fontSize: 14 },
  },
  borderRadius: borderRadius.full,
  fontWeight: 500,
} as const;

// ─── Chip ──────────────────────────────────────────────────────────────────

export const chipTokens = {
  sizes: {
    sm: { height: 28, paddingHorizontal: 10, fontSize: 12, iconSize: iconSize.sm },
    md: { height: 32, paddingHorizontal: 12, fontSize: 14, iconSize: iconSize.md },
    lg: { height: 36, paddingHorizontal: 14, fontSize: 14, iconSize: iconSize.md },
  },
  borderRadius: borderRadius.full,
  borderWidth: 1,
  gap: 4,
} as const;

// ─── Modal / Dialog ────────────────────────────────────────────────────────

export const modalTokens = {
  borderRadius: borderRadiusSemantic.modal,
  padding: spacingSemantic.lg,
  maxWidth: {
    sm: 400,
    md: 520,
    lg: 640,
    xl: 800,
  },
  overlay: {
    backdrop: 'rgba(15, 23, 42, 0.5)',
    blur: 4,
  },
  shadow: shadow.xl,
} as const;

// ─── Toast ─────────────────────────────────────────────────────────────────

export const toastTokens = {
  borderRadius: borderRadius.lg,
  padding: spacingSemantic.md,
  maxWidth: 400,
  shadow: shadow.lg,
  gap: spacingSemantic.sm,
  iconSize: iconSize.lg,
} as const;

// ─── Tooltip ───────────────────────────────────────────────────────────────

export const tooltipTokens = {
  borderRadius: borderRadius.sm,
  padding: {
    horizontal: spacingSemantic.sm,
    vertical: spacingSemantic.xs,
  },
  fontSize: 13,
  lineHeight: 1.4,
  maxWidth: 240,
  shadow: shadow.md,
} as const;

// ─── Divider ───────────────────────────────────────────────────────────────

export const dividerTokens = {
  height: 1,
  margin: {
    vertical: spacingSemantic.md,
    horizontal: 0,
  },
} as const;

// ─── Skeleton ──────────────────────────────────────────────────────────────

export const skeletonTokens = {
  borderRadius: borderRadius.md,
  animation: {
    duration: '1.5s',
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
} as const;

// ─── Backdrop ──────────────────────────────────────────────────────────────

export const backdropTokens = {
  borderRadius: borderRadiusSemantic.modal,
  padding: spacingSemantic.lg,
  maxWidth: 520,
} as const;
