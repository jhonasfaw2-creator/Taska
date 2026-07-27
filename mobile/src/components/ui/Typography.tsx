import React from 'react';
import { Text, TextProps } from 'react-native';

type TypographyVariant = 'display' | 'headline' | 'title' | 'subtitle' | 'body' | 'caption' | 'button';
type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TypographyColor = 'primary' | 'secondary';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  color?: TypographyColor;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<TypographyVariant, string> = {
  display: 'text-display',
  headline: 'text-headline',
  title: 'text-title',
  subtitle: 'text-subtitle',
  body: 'text-body',
  caption: 'text-caption',
  button: 'text-button',
};

const WEIGHT_CLASSES: Record<TypographyWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const COLOR_CLASSES: Record<TypographyColor, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
};

/**
 * Centralized text component. Type scale, weight, and color come from the
 * theme (Tailwind utilities + CSS vars) — never hardcoded literals.
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  weight = 'regular',
  color = 'primary',
  children,
  className,
  style,
  ...rest
}) => {
  return (
    <Text
      className={[
        VARIANT_CLASSES[variant],
        WEIGHT_CLASSES[weight],
        COLOR_CLASSES[color],
        className ?? '',
      ].join(' ')}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Typography;
