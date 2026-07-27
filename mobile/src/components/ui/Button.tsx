import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  Text,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
type ButtonShadow = 'none' | 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  radius?: ButtonRadius;
  shadow?: ButtonShadow;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  radius = 'full',
  shadow = 'none',
  loading = false,
  fullWidth = true,
  leftIcon,
  disabled,
  testID,
  onPress,
}) => {
  const isDisabled = disabled || loading;

  // Manual fallback styles to guarantee it boots without NativeWind interference
  const getBackgroundColor = () => {
    if (isDisabled && variant === 'primary') return 'rgb(79, 70, 229)';
    if (variant === 'primary') return 'rgb(79, 70, 229)';
    if (variant === 'secondary') return 'rgb(248, 249, 250)';
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary') return '#FFFFFF';
    if (variant === 'secondary') return '#111827';
    return 'rgb(79, 70, 229)';
  };

  const getRadius = () => {
    if (radius === 'sm') return 4;
    if (radius === 'md') return 8;
    if (radius === 'lg') return 16;
    return 9999;
  };

  const getShadow = () => {
    if (shadow === 'none' || shadow === undefined) return {};
    if (shadow === 'sm') return { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 };
    if (shadow === 'md') return { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 };
    if (shadow === 'lg') return { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 5 };
    return {};
  };

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
          paddingHorizontal: 24,
          paddingVertical: 16,
          width: fullWidth ? '100%' : 'auto',
          opacity: isDisabled ? 0.6 : 1,
          backgroundColor: getBackgroundColor(),
          borderRadius: getRadius(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: 'rgb(79, 70, 229)',
          ...getShadow(),
        }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#4F46E5'} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
          <Text
            style={{
              color: getTextColor(),
              fontWeight: '600',
              fontSize: 16,
              fontFamily: 'Inter',
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;