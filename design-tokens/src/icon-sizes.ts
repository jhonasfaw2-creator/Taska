export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export const iconSizeSemantic = {
  badge: iconSize.xs,
  inline: iconSize.sm,
  action: iconSize.md,
  button: iconSize.lg,
  buttonLarge: iconSize.lg,
  tab: iconSize.lg,
  input: iconSize.md,
  inputClear: iconSize.sm,
  nav: iconSize.lg,
  navLarge: iconSize.lg,
  avatar: iconSize.lg,
  illustration: iconSize.lg,
  emptyState: iconSize.lg,
} as const;

export type IconSize = keyof typeof iconSize;
export type IconSizeSemantic = keyof typeof iconSizeSemantic;