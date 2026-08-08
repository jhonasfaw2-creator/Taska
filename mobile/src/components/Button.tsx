/**
 * Taska Button Component (Legacy)
 *
 * Backward-compatible button that uses design system tokens via NativeWind.
 * New code should use src/components/ui/Button.tsx instead.
 */

import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Typography } from '@/components/ui';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const VARIANT_CLASSES: Record<string, { container: string; text: string }> = {
  primary: { container: 'bg-primary', text: 'text-background' },
  secondary: { container: 'bg-surface-secondary', text: 'text-text-primary' },
  outline: { container: 'bg-transparent border-primary', text: 'text-primary' },
  ghost: { container: 'bg-transparent', text: 'text-primary' },
  text: { container: 'bg-transparent', text: 'text-primary' },
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'h-9 px-3.5 py-1.5',
  md: 'h-11 px-5 py-2',
  lg: 'h-13 px-7 py-3',
  xl: 'h-14 px-8 py-3.5',
};

const TEXT_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
  xl: 'text-lg',
};

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  disabled,
  testID,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;

  return (
    <TouchableOpacity
      className={[
        'flex-row items-center justify-center rounded-full',
        variantClasses.container,
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-disabled' : '',
      ].join(' ')}
      style={style}
      disabled={isDisabled}
      testID={testID}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : '#2563EB'}
          testID={`${testID ?? 'button'}-loader`}
        />
      ) : (
        <Typography
          variant="label-md"
          weight="semibold"
          className={[variantClasses.text, TEXT_SIZE_CLASSES[size], textStyle].filter(Boolean).join(' ')}
        >
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

export default Button;
