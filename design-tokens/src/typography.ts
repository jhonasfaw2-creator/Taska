export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
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
  tight: 1.1,
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

export const fontSize = {
  display: { size: 72, lineHeight: lineHeight.tight, letterSpacing: letterSpacing.tight },
  'display-sm': { size: 56, lineHeight: lineHeight.tight, letterSpacing: letterSpacing.tight },
  headline: { size: 32, lineHeight: lineHeight.tight, letterSpacing: letterSpacing.tight },
  title: { size: 24, lineHeight: lineHeight.snug, letterSpacing: letterSpacing.normal },
  subtitle: { size: 18, lineHeight: lineHeight.normal, letterSpacing: letterSpacing.normal },
  body: { size: 16, lineHeight: lineHeight.relaxed, letterSpacing: letterSpacing.normal },
  'body-lg': { size: 18, lineHeight: lineHeight.relaxed, letterSpacing: letterSpacing.normal },
  'body-sm': { size: 14, lineHeight: lineHeight.normal, letterSpacing: letterSpacing.normal },
  caption: { size: 12, lineHeight: lineHeight.normal, letterSpacing: letterSpacing.wide },
  'caption-sm': { size: 11, lineHeight: lineHeight.normal, letterSpacing: letterSpacing.wide },
  overline: { size: 10, lineHeight: lineHeight.normal, letterSpacing: letterSpacing.widest },
} as const;

export const hierarchy = {
  display: { fontSize: 72, lineHeight: lineHeight.tight, letterSpacing: letterSpacing.tight, fontWeight: fontWeight.bold },
  headline: { fontSize: 32, lineHeight: lineHeight.tight, letterSpacing: letterSpacing.tight, fontWeight: fontWeight.bold },
  title: { fontSize: 24, lineHeight: lineHeight.snug, letterSpacing: letterSpacing.normal, fontWeight: fontWeight.semibold },
  subtitle: { fontSize: 18, lineHeight: lineHeight.normal, letterSpacing: letterSpacing.normal, fontWeight: fontWeight.regular },
  body: { fontSize: 16, lineHeight: lineHeight.relaxed, letterSpacing: letterSpacing.normal, fontWeight: fontWeight.regular },
  caption: { fontSize: 12, lineHeight: lineHeight.normal, letterSpacing: letterSpacing.wide, fontWeight: fontWeight.medium },
  button: { fontSize: 16, lineHeight: lineHeight.normal, letterSpacing: letterSpacing.normal, fontWeight: fontWeight.bold },
} as const;

export const typography = {
  display: fontSize.display,
  'display-sm': fontSize['display-sm'],
  headline: fontSize.headline,
  title: fontSize.title,
  subtitle: fontSize.subtitle,
  body: fontSize.body,
  'body-lg': fontSize['body-lg'],
  'body-sm': fontSize['body-sm'],
  caption: fontSize.caption,
  'caption-sm': fontSize['caption-sm'],
  overline: fontSize.overline,
} as const;

export const textStyle = {
  display: { ...fontSize.display, fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  'display-sm': { ...fontSize['display-sm'], fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  headline: { ...fontSize.headline, fontWeight: fontWeight.bold, fontFamily: fontFamily.sans.join(',') },
  title: { ...fontSize.title, fontWeight: fontWeight.semibold, fontFamily: fontFamily.sans.join(',') },
  subtitle: { ...fontSize.subtitle, fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  body: { ...fontSize.body, fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  'body-lg': { ...fontSize['body-lg'], fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  'body-sm': { ...fontSize['body-sm'], fontWeight: fontWeight.regular, fontFamily: fontFamily.sans.join(',') },
  caption: { ...fontSize.caption, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  'caption-sm': { ...fontSize['caption-sm'], fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  overline: { ...fontSize.overline, fontWeight: fontWeight.medium, fontFamily: fontFamily.sans.join(',') },
  mono: { ...fontSize.body, fontWeight: fontWeight.regular, fontFamily: fontFamily.mono.join(',') },
  'mono-sm': { ...fontSize['body-sm'], fontWeight: fontWeight.regular, fontFamily: fontFamily.mono.join(',') },
} as const;

export type FontFamily = keyof typeof fontFamily;
export type FontWeight = keyof typeof fontWeight;
export type LineHeight = keyof typeof lineHeight;
export type LetterSpacing = keyof typeof letterSpacing;
export type FontSize = keyof typeof fontSize;
export type TextStyle = keyof typeof textStyle;