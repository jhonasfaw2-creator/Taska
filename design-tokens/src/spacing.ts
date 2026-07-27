export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
} as const;

export const spacingSemantic = {
  none: spacing[0],
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
  '2xl': spacing[12],
  '3xl': spacing[16],
  '4xl': spacing[24],
} as const;

export const screenPadding = {
  mobile: spacing[6],
  tablet: spacing[8],
  desktop: spacing[10],
} as const;

export type SpacingScale = keyof typeof spacing;
export type SpacingSemantic = keyof typeof spacingSemantic;
export type ScreenPadding = keyof typeof screenPadding;