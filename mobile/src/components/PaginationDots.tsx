import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../theme/types';

interface PaginationDotsProps {
  count: number;
  activeIndex: number;
  theme: Theme;
  style?: ViewStyle;
  testID?: string;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({
  count,
  activeIndex,
  theme,
  style,
  testID,
}) => {
  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessible
      accessibilityLabel={`Page ${activeIndex + 1} of ${count}`}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              {
                backgroundColor: isActive ? theme.colors.primary : theme.colors.border,
                width: isActive ? theme.spacing.lg : theme.spacing.sm,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 9999,
    marginHorizontal: 4,
  },
});

export default PaginationDots;
