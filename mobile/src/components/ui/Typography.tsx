/**
 * Taska Typography Component
 *
 * Centralized text component with design system variants.
 * Maps to the design-tokens type scale.
 */

import React from 'react';
import { Text, TextProps } from 'react-native';

// ─── Variants ──────────────────────────────────────────────────────────────

type TypographyVariant =
  | 'display-2xl' | 'display-xl' | 'display-lg' | 'display-md' | 'display-sm' | 'display-xs'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body-xl' | 'body-lg' | 'body-md' | 'body-sm' | 'body-xs'
  | 'label-lg' | 'label-md' | 'label-sm' | 'label-xs'
  | 'code'
  // Legacy (backward compatibility)
  | 'display' | 'headline' | 'title' | 'subtitle' | 'body' | 'caption' | 'button';

type TypographyWeight =
  | 'thin' | 'extralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

type TypographyColor =
  | 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'disabled' | 'link' | 'error' | 'success' | 'warning';

type TypographyAlign = 'left' | 'center' | 'right';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  color?: TypographyColor;
  align?: TypographyAlign;
  truncate?: boolean;
  children: React.ReactNode;
  className?: string;
}

// ─── Variant Classes ───────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<TypographyVariant, string> = {
  // Display (hero/marketing)
  'display-2xl': 'text-display-2xl',
  'display-xl': 'text-display-xl',
  'display-lg': 'text-display-lg',
  'display-md': 'text-display-md',
  'display-sm': 'text-display-sm',
  'display-xs': 'text-display-xs',

  // Headings
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
  h5: 'text-h5',
  h6: 'text-h6',

  // Body
  'body-xl': 'text-body-xl',
  'body-lg': 'text-body-lg',
  'body-md': 'text-body-md',
  'body-sm': 'text-body-sm',
  'body-xs': 'text-body-xs',

  // Labels
  'label-lg': 'text-label-lg',
  'label-md': 'text-label-md',
  'label-sm': 'text-label-sm',
  'label-xs': 'text-label-xs',

  // Code
  code: 'font-mono',

  // Legacy (mapped to new system)
  display: 'text-display',
  headline: 'text-headline',
  title: 'text-title',
  subtitle: 'text-subtitle',
  body: 'text-body',
  caption: 'text-caption',
  button: 'text-button',
};

// ─── Weight Classes ────────────────────────────────────────────────────────

const WEIGHT_CLASSES: Record<TypographyWeight, string> = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

// ─── Color Classes ─────────────────────────────────────────────────────────

const COLOR_CLASSES: Record<TypographyColor, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  inverse: 'text-text-inverse',
  disabled: 'text-text-disabled',
  link: 'text-text-link',
  error: 'text-error',
  success: 'text-success',
  warning: 'text-warning',
};

// ─── Align Classes ─────────────────────────────────────────────────────────

const ALIGN_CLASSES: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * Centralized text component. Type scale, weight, and color come from the
 * theme (Tailwind utilities + CSS vars) — never hardcoded literals.
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body-md',
  weight = 'regular',
  color = 'primary',
  align,
  truncate,
  children,
  className,
  style,
  ...rest
}) => {
  return (
    <Text
      className={[
        'font-sans',
        VARIANT_CLASSES[variant],
        WEIGHT_CLASSES[weight],
        COLOR_CLASSES[color],
        align ? ALIGN_CLASSES[align] : '',
        truncate ? 'truncate' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      style={style}
      numberOfLines={truncate ? 1 : undefined}
      ellipsizeMode={truncate ? 'tail' : undefined}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Typography;
