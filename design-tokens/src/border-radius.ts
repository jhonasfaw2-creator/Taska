export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  '4xl': 24,
  full: 9999,
} as const;

export const borderRadiusSemantic = {
  none: borderRadius.none,
  xs: borderRadius.xs,
  sm: borderRadius.sm,
  md: borderRadius.md,
  lg: borderRadius.lg,
  xl: borderRadius.xl,
  '2xl': borderRadius['2xl'],
  full: borderRadius.full,
  card: borderRadius.lg,
  button: borderRadius.lg,
  input: borderRadius.lg,
  badge: borderRadius.full,
  modal: borderRadius.xl,
  sheet: borderRadius.xl,
  dialog: borderRadius.lg,
  tooltip: borderRadius.sm,
  tag: borderRadius.full,
} as const;

export type BorderRadiusScale = keyof typeof borderRadius;
export type BorderRadiusSemantic = keyof typeof borderRadiusSemantic;