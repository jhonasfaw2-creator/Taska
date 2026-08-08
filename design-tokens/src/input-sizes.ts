/**
 * Taska Design Tokens — Input Sizes
 *
 * Modern, accessible input sizing
 * Minimum touch target: 44px (WCAG 2.1)
 * Inspiration: Material 3, Linear
 */

export const inputSize = {
  /**
   * Default — Standard form inputs
   */
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

  /**
   * Default — Standard form inputs
   */
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

  /**
   * Large — Prominent inputs, search bars
   */
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
} as const;

/**
 * Textarea sizes
 */
export const textareaSize = {
  sm: {
    minHeight: 80,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    lineHeight: 1.5,
    borderRadius: 8,
  },
  md: {
    minHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    lineHeight: 1.5,
    borderRadius: 8,
  },
  lg: {
    minHeight: 140,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 1.5,
    borderRadius: 10,
  },
} as const;

/**
 * Select sizes
 */
export const selectSize = {
  sm: {
    height: 36,
    minWidth: 120,
    paddingHorizontal: 12,
    fontSize: 14,
    iconSize: 16,
    borderRadius: 8,
  },
  md: {
    height: 44,
    minWidth: 160,
    paddingHorizontal: 14,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 8,
  },
  lg: {
    height: 52,
    minWidth: 200,
    paddingHorizontal: 16,
    fontSize: 16,
    iconSize: 24,
    borderRadius: 10,
  },
} as const;

/**
 * Checkbox and Radio sizes
 */
export const checkboxSize = {
  sm: {
    size: 16,
    borderRadius: 4,
    fontSize: 14,
  },
  md: {
    size: 20,
    borderRadius: 6,
    fontSize: 16,
  },
  lg: {
    size: 24,
    borderRadius: 6,
    fontSize: 16,
  },
} as const;

/**
 * Switch sizes
 */
export const switchSize = {
  sm: {
    width: 36,
    height: 20,
    thumbSize: 16,
    borderRadius: 10,
  },
  md: {
    width: 44,
    height: 24,
    thumbSize: 20,
    borderRadius: 12,
  },
  lg: {
    width: 52,
    height: 28,
    thumbSize: 24,
    borderRadius: 14,
  },
} as const;

export type InputSizeName = keyof typeof inputSize;
export type TextareaSizeName = keyof typeof textareaSize;
export type SelectSizeName = keyof typeof selectSize;
export type CheckboxSizeName = keyof typeof checkboxSize;
export type SwitchSizeName = keyof typeof switchSize;
