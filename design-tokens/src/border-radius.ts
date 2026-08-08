/**
 * Taska Design Tokens — Border Radius
 *
 * Modern, consistent radius scale
 * Inspiration: Linear (minimal), Material 3 (expressive)
 */

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

/**
 * Semantic border radius — maps to component usage
 */
export const borderRadiusSemantic = {
  // Base scale
  none: borderRadius.none,
  xs: borderRadius.xs,
  sm: borderRadius.sm,
  md: borderRadius.md,
  lg: borderRadius.lg,
  xl: borderRadius.xl,
  '2xl': borderRadius['2xl'],
  '3xl': borderRadius['3xl'],
  '4xl': borderRadius['4xl'],
  full: borderRadius.full,

  // Component-specific tokens
  card: borderRadius.lg,        // 8px — Cards, containers
  button: borderRadius.lg,      // 8px — Buttons
  input: borderRadius.lg,       // 8px — Input fields
  badge: borderRadius.full,     // Pill — Badges, tags
  modal: borderRadius.xl,       // 12px — Modals, dialogs
  sheet: borderRadius['2xl'],    // 16px — Bottom sheets
  dialog: borderRadius.xl,      // 12px — Dialogs
  tooltip: borderRadius.sm,     // 4px — Tooltips
  tag: borderRadius.md,         // 6px — Tags, chips
  avatar: borderRadius.full,    // Circle — Avatars
  image: borderRadius.lg,       // 8px — Image containers
  divider: borderRadius.none,   // 0px — Dividers
} as const;

export type BorderRadiusScale = keyof typeof borderRadius;
export type BorderRadiusSemantic = keyof typeof borderRadiusSemantic;
