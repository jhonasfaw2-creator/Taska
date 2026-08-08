/**
 * Taska Logo Component (Legacy)
 *
 * Backward-compatible logo that uses the theme prop.
 * New code should use src/components/ui/Logo.tsx instead.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../theme/types';

interface LogoProps {
  size?: number;
  theme: Theme;
  style?: ViewStyle;
}

const Logo: React.FC<LogoProps> = ({ size = 120, theme, style }) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: theme.shapes.card,
          backgroundColor: theme.colors.primary,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: theme.shapes.tag,
            backgroundColor: theme.colors.primaryHover,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Logo;
