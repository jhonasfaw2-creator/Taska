import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { Theme } from '../theme/types';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  theme: Theme;
  variant?: 'primary' | 'text' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  theme,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  disabled,
  testID,
  ...rest
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const containerStyle: ViewStyle = {
    backgroundColor: isPrimary ? theme.colors.primary : 'transparent',
    borderColor: isOutline ? theme.colors.primary : 'transparent',
    borderWidth: isOutline ? 1.5 : 0,
    borderRadius: theme.shapes.borderRadius.full,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const labelStyle: TextStyle = {
    color: isPrimary ? theme.colors.background : theme.colors.primary,
    fontSize: theme.typography.fontSize.button,
    fontWeight: theme.typography.fontWeight.semibold,
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? theme.colors.background : theme.colors.primary}
          testID={`${testID ?? 'button'}-loader`}
        />
      ) : (
        <Text style={[labelStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
