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
  sm: borderRadius.sm,
  md: borderRadius.md,
  lg: borderRadius.lg,
  xl: borderRadius.xl,
  '2xl': borderRadius['2xl'],
  full: borderRadius.full,
  card: borderRadius.xl,
  button: borderRadius.lg,
  input: borderRadius.lg,
  badge: borderRadius.full,
  modal: borderRadius['2xl'],
  sheet: borderRadius['2xl'],
  dialog: borderRadius.xl,
  tooltip: borderRadius.md,
} as const;

export type BorderRadiusScale = keyof typeof borderRadius;
export type BorderRadiusSemantic = keyof typeof borderRadiusSemantic;