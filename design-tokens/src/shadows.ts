/**
 * Taska Design Tokens — Shadows & Elevation
 *
 * Subtle, modern shadow system
 * Inspiration: Material 3 (elevation), Linear (subtle)
 */

export interface ShadowValue {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
  boxShadow?: string;
}

/**
 * Shadow scale — Progressive elevation levels
 */
export const shadow = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 16,
  },
  '2xl': {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
} as const;

/**
 * Elevation scale — Material-inspired z-axis levels
 */
export const elevation = {
  none: 0,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

/**
 * Semantic elevation — Maps to component usage
 */
export const elevationSemantic = {
  none: elevation.none,

  // Low elevation
  card: elevation.xs,           // Subtle lift for cards
  chip: elevation.xs,           // Chips, tags
  button: elevation.sm,         // Floating action buttons

  // Medium elevation
  elevated: elevation.md,       // Elevated cards
  dropdown: elevation.lg,       // Dropdown menus
  fab: elevation.md,            // Floating action buttons
  select: elevation.lg,         // Select dropdowns

  // High elevation
  modal: elevation.xl,          // Modals, dialogs
  sheet: elevation.xl,          // Bottom sheets
  drawer: elevation.lg,         // Side drawers
  toast: elevation.lg,          // Toast notifications
  tooltip: elevation.sm,        // Tooltips
  popover: elevation.xl,        // Popovers
} as const;

export type ShadowScale = keyof typeof shadow;
export type ElevationScale = keyof typeof elevation;
export type ElevationSemantic = keyof typeof elevationSemantic;
