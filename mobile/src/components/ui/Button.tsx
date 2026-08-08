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
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';

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

// ─── Size Styles ───────────────────────────────────────────────────────────

const SIZE_STYLES: Record<ButtonSize, ViewStyle> = {
  sm: {
    height: 36,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  md: {
    height: 44,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  lg: {
    height: 52,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  xl: {
    height: 56,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
};

const SIZE_TEXT_STYLES: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 16 },
  xl: { fontSize: 18 },
};

// ─── Radius Styles ─────────────────────────────────────────────────────────

const RADIUS_STYLES: Record<ButtonRadius, number> = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
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

// ─── Variant Colors ────────────────────────────────────────────────────────

const VARIANT_COLORS: Record<ButtonVariant, { bg: string; bgDisabled: string; text: string; border?: string }> = {
  primary: { bg: '#2563EB', bgDisabled: '#93C5FD', text: '#FFFFFF' },
  secondary: { bg: '#F1F5F9', bgDisabled: '#E2E8F0', text: '#0F172A' },
  outline: { bg: 'transparent', bgDisabled: 'transparent', text: '#2563EB', border: '#2563EB' },
  ghost: { bg: 'transparent', bgDisabled: 'transparent', text: '#2563EB' },
  success: { bg: '#22C55E', bgDisabled: '#86EFAC', text: '#FFFFFF' },
  warning: { bg: '#F59E0B', bgDisabled: '#FCD34D', text: '#FFFFFF' },
  error: { bg: '#EF4444', bgDisabled: '#FCA5A5', text: '#FFFFFF' },
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
  const colors = VARIANT_COLORS[variant];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      activeOpacity={0.85}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: fullWidth ? '100%' : 'auto',
          opacity: isDisabled ? 0.6 : 1,
          backgroundColor: isDisabled ? colors.bgDisabled : colors.bg,
          borderRadius: RADIUS_STYLES[radius],
          borderWidth: colors.border ? 1 : 0,
          borderColor: colors.border,
        },
        SIZE_STYLES[size],
        SHADOW_STYLES[shadow],
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {leftIcon && <View>{leftIcon}</View>}
          <Text
            style={[
              {
                color: colors.text,
                fontWeight: '600',
                fontFamily: 'Inter',
              },
              SIZE_TEXT_STYLES[size],
              textStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon && <View>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
