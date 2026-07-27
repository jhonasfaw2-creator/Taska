export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 56,
  '6xl': 64,
} as const;

export const iconSizeSemantic = {
  badge: iconSize.xs,
  inline: iconSize.sm,
  action: iconSize.md,
  button: iconSize.lg,
  buttonLarge: iconSize.xl,
  tab: iconSize['2xl'],
  input: iconSize.md,
  inputClear: iconSize.sm,
  nav: iconSize.lg,
  navLarge: iconSize['2xl'],
  avatar: iconSize['3xl'],
  illustration: iconSize['5xl'],
  emptyState: iconSize['6xl'],
} as const;

export type IconSize = keyof typeof iconSize;
export type IconSizeSemantic = keyof typeof iconSizeSemantic;