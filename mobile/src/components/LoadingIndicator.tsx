import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../theme/types';

interface LoadingIndicatorProps {
  theme: Theme;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  theme,
  size = 'large',
  color,
  style,
}) => {
  return (
    <View style={[styles.container, { paddingVertical: theme.spacing.md }, style]}>
      <ActivityIndicator
        size={size}
        color={color || theme.colors.primary}
        testID="splash-loading-indicator"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
});

export default LoadingIndicator;
