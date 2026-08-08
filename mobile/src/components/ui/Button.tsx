/**
 * Taska Button Component
 *
 * Modern, accessible button with design system tokens.
 * Supports primary, secondary, outline, ghost, success, warning, error variants.
 */

import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Typography } from './Typography';

// ─── Types ─────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonRadius = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ButtonShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;
  shadow?: ButtonShadow;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

// ─── Variant Classes ────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<ButtonVariant, { container: string; text: string; disabledContainer: string; disabledText: string }> = {
  primary: {
    container: 'bg-primary',
    text: 'text-background',
    disabledContainer: 'bg-primary-variant',
    disabledText: 'text-background/70',
  },
  secondary: {
    container: 'bg-surface-secondary',
    text: 'text-text-primary',
    disabledContainer: 'bg-neutral-200',
    disabledText: 'text-text-disabled',
  },
  outline: {
    container: 'bg-transparent border-primary',
    text: 'text-primary',
    disabledContainer: 'bg-transparent border-neutral-300',
    disabledText: 'text-text-disabled',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-primary',
    disabledContainer: 'bg-transparent',
    disabledText: 'text-text-disabled',
  },
  success: {
    container: 'bg-success',
    text: 'text-on-success',
    disabledContainer: 'bg-success/60',
    disabledText: 'text-on-success/70',
  },
  warning: {
    container: 'bg-warning',
    text: 'text-on-warning',
    disabledContainer: 'bg-warning/60',
    disabledText: 'text-on-warning/70',
  },
  error: {
    container: 'bg-error',
    text: 'text-on-error',
    disabledContainer: 'bg-error/60',
    disabledText: 'text-on-error/70',
  },
};

// ─── Radius Classes ─────────────────────────────────────────────────────────

const RADIUS_CLASSES: Record<ButtonRadius, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

// ─── Shadow Styles ─────────────────────────────────────────────────────────

const SHADOW_STYLES: Record<ButtonShadow, ViewStyle> = {
  none: {},
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 16,
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  radius = 'full',
  shadow = 'none',
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID,
  onPress,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const variantClasses = VARIANT_CLASSES[variant];
  const radiusClass = RADIUS_CLASSES[radius];
  const shadowStyle = SHADOW_STYLES[shadow];

  const containerClassName = [
    'flex-row items-center justify-center',
    variantClasses.container,
    isDisabled ? variantClasses.disabledContainer : '',
    radiusClass,
    fullWidth ? 'w-full' : '',
    isDisabled ? 'opacity-disabled' : '',
    shadow !== 'none' ? 'shadow-sm' : '',
  ].filter(Boolean).join(' ');

  const textClassName = [
    'font-semibold',
    variantClasses.text,
    isDisabled ? variantClasses.disabledText : '',
  ].filter(Boolean).join(' ');

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      activeOpacity={0.85}
      className={containerClassName}
      style={[shadowStyle, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isDisabled ? 'rgba(255,255,255,0.7)' : '#FFFFFF'} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {leftIcon && <View>{leftIcon}</View>}
          <Typography variant="label-md" weight="semibold" className={textClassName} style={textStyle}>
            {label}
          </Typography>
          {rightIcon && <View>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
