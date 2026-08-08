/**
 * Taska Design Tokens — Icon Sizes
 *
 * Consistent icon sizing system
 * Based on 4px grid for alignment
 */

export const iconSize = {
  xs: 12,    // Inline badges, micro icons
  sm: 16,    // Inline text icons, small UI
  md: 20,    // Standard UI icons (default)
  lg: 24,    // Button icons, navigation
  xl: 32,    // Feature icons, large buttons
  '2xl': 40, // Hero icons, empty states
  '3xl': 48, // Illustrations, onboarding
} as const;

/**
 * Semantic icon sizes — Maps to component usage
 */
export const iconSizeSemantic = {
  // Inline
  badge: iconSize.xs,
  inline: iconSize.sm,
  caption: iconSize.xs,

  // Input
  input: iconSize.md,
  inputClear: iconSize.sm,
  inputTrailing: iconSize.md,

  // Button
  buttonSm: iconSize.sm,
  buttonMd: iconSize.md,
  buttonLg: iconSize.lg,

  // Navigation
  nav: iconSize.lg,
  navLarge: iconSize.xl,
  tab: iconSize.lg,
  tabBar: iconSize.lg,

  // Avatar
  avatarXs: iconSize.sm,
  avatarSm: iconSize.md,
  avatarMd: iconSize.lg,
  avatarLg: iconSize.xl,

  // Feature
  feature: iconSize.xl,
  emptyState: iconSize['2xl'],
  illustration: iconSize['3xl'],

  // Media
  thumbnail: iconSize.lg,
  image: iconSize.xl,
} as const;

export type IconSize = keyof typeof iconSize;
export type IconSizeSemantic = keyof typeof iconSizeSemantic;
