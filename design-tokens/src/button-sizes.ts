/**
 * Taska Design Tokens — Button Sizes
 *
 * Modern, accessible button sizing
 * Minimum touch target: 44px (WCAG 2.1)
 * Inspiration: Material 3, Linear
 */

export const buttonSize = {
  /**
   * Compact — Dense UI, secondary actions
   */
  sm: {
    height: 36,
    minWidth: 48,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 500 as const,
    iconSize: 16,
    iconGap: 4,
    borderRadius: 8,
  },

  /**
   * Default — Standard UI actions
   */
  md: {
    height: 44,
    minWidth: 80,
    paddingHorizontal: 20,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 500 as const,
    iconSize: 20,
    iconGap: 8,
    borderRadius: 8,
  },

  /**
   * Large — Primary CTAs, hero actions
   */
  lg: {
    height: 52,
    minWidth: 96,
    paddingHorizontal: 28,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 500 as const,
    iconSize: 24,
    iconGap: 8,
    borderRadius: 10,
  },

  /**
   * Extra Large — Full-width mobile CTAs
   */
  xl: {
    height: 56,
    minWidth: 120,
    paddingHorizontal: 32,
    paddingVertical: 14,
    fontSize: 18,
    lineHeight: 1.5,
    fontWeight: 500 as const,
    iconSize: 24,
    iconGap: 10,
    borderRadius: 12,
  },
} as const;

/**
 * Icon-only button sizes (square aspect ratio)
 */
export const iconButtonSize = {
  sm: {
    size: 36,
    iconSize: 16,
    borderRadius: 8,
  },
  md: {
    size: 44,
    iconSize: 20,
    borderRadius: 10,
  },
  lg: {
    size: 52,
    iconSize: 24,
    borderRadius: 12,
  },
  xl: {
    size: 56,
    iconSize: 24,
    borderRadius: 12,
  },
} as const;

/**
 * Minimum widths for text buttons
 */
export const buttonMinWidth = {
  sm: 48,
  md: 80,
  lg: 96,
  xl: 120,
} as const;

export type ButtonSizeName = keyof typeof buttonSize;
export type IconButtonSizeName = keyof typeof iconButtonSize;
