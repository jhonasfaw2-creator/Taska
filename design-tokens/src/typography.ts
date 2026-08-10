/**
 * Taska Design Tokens — Typography
 *
 * Type Scale: Modern, clean, and highly readable
 * Font: Inter (Google Fonts) — optimized for UI
 * Inspiration: Linear, Notion, Material 3
 */

export const fontFamily = {
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'SF Mono',
    'Consolas',
    'Monaco',
    'monospace',
  ],
} as const;

export const fontWeight = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

export const lineHeight = {
  none: 1,
  tight: 1.15,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/**
 * Type Scale — Display sizes for hero sections and marketing
 */
export const fontSize = {
  'display-2xl': { size: 72, lineHeight: 1.1, letterSpacing: '-0.03em' },
  'display-xl': { size: 60, lineHeight: 1.1, letterSpacing: '-0.03em' },
  'display-lg': { size: 48, lineHeight: 1.15, letterSpacing: '-0.025em' },
  'display-md': { size: 36, lineHeight: 1.2, letterSpacing: '-0.02em' },
  'display-sm': { size: 30, lineHeight: 1.25, letterSpacing: '-0.015em' },
  'display-xs': { size: 24, lineHeight: 1.3, letterSpacing: '-0.01em' },
  display: { size: 48, lineHeight: 1.1, letterSpacing: '-0.025em' },
  headline: { size: 32, lineHeight: 1.2, letterSpacing: '-0.02em' },
  title: { size: 24, lineHeight: 1.3, letterSpacing: '-0.01em' },
  subtitle: { size: 18, lineHeight: 1.5, letterSpacing: '0em' },
  body: { size: 16, lineHeight: 1.625, letterSpacing: '0em' },
  caption: { size: 12, lineHeight: 1.5, letterSpacing: '0.01em' },
  button: { size: 14, lineHeight: 1.5, letterSpacing: '0.01em' },
} as const;

/**
 * Type Scale — Headings for page structure
 */
export const heading = {
  h1: { size: 30, lineHeight: 1.25, letterSpacing: '-0.015em' },
  h2: { size: 24, lineHeight: 1.3, letterSpacing: '-0.01em' },
  h3: { size: 20, lineHeight: 1.35, letterSpacing: '-0.005em' },
  h4: { size: 18, lineHeight: 1.4, letterSpacing: '0em' },
  h5: { size: 16, lineHeight: 1.45, letterSpacing: '0em' },
  h6: { size: 14, lineHeight: 1.5, letterSpacing: '0.01em' },
} as const;

/**
 * Type Scale — Body text for content
 */
export const body = {
  xl: { size: 20, lineHeight: 1.6, letterSpacing: '0em' },
  lg: { size: 18, lineHeight: 1.6, letterSpacing: '0em' },
  md: { size: 16, lineHeight: 1.6, letterSpacing: '0em' },
  sm: { size: 14, lineHeight: 1.5, letterSpacing: '0.01em' },
  xs: { size: 12, lineHeight: 1.5, letterSpacing: '0.01em' },
} as const;

/**
 * Type Scale — Labels and UI elements
 */
export const label = {
  lg: { size: 16, lineHeight: 1.5, letterSpacing: '0.01em' },
  md: { size: 14, lineHeight: 1.5, letterSpacing: '0.01em' },
  sm: { size: 12, lineHeight: 1.5, letterSpacing: '0.02em' },
  xs: { size: 11, lineHeight: 1.5, letterSpacing: '0.02em' },
} as const;

/**
 * Type Scale — Code and monospace
 */
export const code = {
  lg: { size: 16, lineHeight: 1.5, letterSpacing: '0em' },
  md: { size: 14, lineHeight: 1.5, letterSpacing: '0em' },
  sm: { size: 13, lineHeight: 1.5, letterSpacing: '0em' },
  xs: { size: 12, lineHeight: 1.5, letterSpacing: '0em' },
} as const;

/**
 * Typography hierarchy with font weights
 */
export const hierarchy = {
  'display-2xl': { ...fontSize['display-2xl'], fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  'display-xl': { ...fontSize['display-xl'], fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  'display-lg': { ...fontSize['display-lg'], fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  'display-md': { ...fontSize['display-md'], fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  'display-sm': { ...fontSize['display-sm'], fontWeight: fontWeight.semibold, fontFamily: fontFamily.sans.join(',') },
  'display-xs': { ...fontSize['display-xs'], fontWeight: fontWeight.semibold, fontFamily: fontFamily.sans.join(',') },
  h1: { ...heading.h1, fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  h2: { ...heading.h2, fontWeight: fontWeight.semibold, fontFamily: fontFamily.sans.join(',') },
  h3: { ...heading.h3, fontWeight: fontWeight.semibold, fontFamily: fontFamily.sans.join(',') },
  h4: { ...heading.h4, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  h5: { ...heading.h5, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  h6: { ...heading.h6, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  'body-xl': { ...body.xl, fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  'body-lg': { ...body.lg, fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  'body-md': { ...body.md, fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  'body-sm': { ...body.sm, fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  'body-xs': { ...body.xs, fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  'label-lg': { ...label.lg, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  'label-md': { ...label.md, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  'label-sm': { ...label.sm, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  'label-xs': { ...label.xs, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  'code-md': { ...code.md, fontWeight: fontWeight.regular, fontFamily: fontFamily.mono.join(',') },
  'code-sm': { ...code.sm, fontWeight: fontWeight.regular, fontFamily: fontFamily.mono.join(',') },
  display: { ...fontSize.display, fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  headline: { ...fontSize.headline, fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  title: { ...fontSize.title, fontWeight: fontWeight.semibold, fontFamily: fontFamily.sans.join(',') },
  subtitle: { ...fontSize.subtitle, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  body: { ...fontSize.body, fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  button: { ...fontSize.button, fontWeight: fontWeight.semibold, fontFamily: fontFamily.sans.join(',') },
  caption: { ...fontSize.caption, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  overline: { size: 11, lineHeight: 1.5, letterSpacing: '0.06em', fontWeight: fontWeight.semibold, fontFamily: fontFamily.sans.join(',') },
} as const;

/**
 * Legacy typography export for backward compatibility
 */
export const typography = {
  ...fontSize,
  ...heading,
  body: body.md,
  'body-lg': body.lg,
  'body-sm': body.sm,
  'body-xs': body.xs,
  caption: body.xs,
  overline: { size: 11, lineHeight: 1.5, letterSpacing: '0.06em' },
} as const;

/**
 * Text styles — Ready-to-use style objects
 */
export const textStyle = {
  'display-2xl': { ...hierarchy['display-2xl'] },
  'display-xl': { ...hierarchy['display-xl'] },
  'display-lg': { ...hierarchy['display-lg'] },
  'display-md': { ...hierarchy['display-md'] },
  'display-sm': { ...hierarchy['display-sm'] },
  'display-xs': { ...hierarchy['display-xs'] },
  h1: { ...hierarchy.h1 },
  h2: { ...hierarchy.h2 },
  h3: { ...hierarchy.h3 },
  h4: { ...hierarchy.h4 },
  h5: { ...hierarchy.h5 },
  h6: { ...hierarchy.h6 },
  'body-xl': { ...hierarchy['body-xl'] },
  'body-lg': { ...hierarchy['body-lg'] },
  'body-md': { ...hierarchy['body-md'] },
  'body-sm': { ...hierarchy['body-sm'] },
  'body-xs': { ...hierarchy['body-xs'] },
  'label-lg': { ...hierarchy['label-lg'] },
  'label-md': { ...hierarchy['label-md'] },
  'label-sm': { ...hierarchy['label-sm'] },
  'label-xs': { ...hierarchy['label-xs'] },
  'code-md': { ...hierarchy['code-md'] },
  'code-sm': { ...hierarchy['code-sm'] },
  button: { ...hierarchy.button },
  caption: { ...hierarchy.caption },
  overline: { ...hierarchy.overline },
} as const;

export type FontFamily = keyof typeof fontFamily;
export type FontWeight = keyof typeof fontWeight;
export type LineHeight = keyof typeof lineHeight;
export type LetterSpacing = keyof typeof letterSpacing;
export type FontSize = keyof typeof fontSize;
export type Heading = keyof typeof heading;
export type Body = keyof typeof body;
export type Label = keyof typeof label;
export type TextStyle = keyof typeof textStyle;
