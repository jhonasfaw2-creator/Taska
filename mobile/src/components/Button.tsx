/**
 * Taska Button Component (Legacy)
 *
 * Backward-compatible button that uses the theme prop.
 * New code should use src/components/ui/Button.tsx instead.
 */

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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
  size = 'md',
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  disabled,
  testID,
  ...rest
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  // Get size from theme
  const sizeConfig = theme.buttonSizes[size];

  // Get background color based on variant
  const getBackgroundColor = (): string => {
    if (isPrimary) return theme.colors.primary;
    if (isSecondary) return theme.colors.surfaceSecondary;
    return 'transparent';
  };

  // Get text color based on variant
  const getTextColor = (): string => {
    if (isPrimary) return theme.colors.onPrimary;
    if (isSecondary) return theme.colors.textPrimary;
    if (isOutline || isGhost) return theme.colors.primary;
    return theme.colors.textPrimary;
  };

  // Get border color
  const getBorderColor = (): string => {
    if (isOutline) return theme.colors.primary;
    return 'transparent';
  };

  const containerStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: isOutline ? 1.5 : 0,
    borderRadius: theme.shapes.button,
    height: sizeConfig.height,
    minWidth: sizeConfig.minWidth,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    paddingVertical: sizeConfig.paddingVertical,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const labelStyle: TextStyle = {
    color: getTextColor(),
    fontSize: sizeConfig.fontSize,
    fontWeight: sizeConfig.fontWeight,
    fontFamily: theme.typography.fontFamily.sans,
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
          color={isPrimary ? theme.colors.onPrimary : theme.colors.primary}
          testID={`${testID ?? 'button'}-loader`}
        />
      ) : (
        <Text style={[labelStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
