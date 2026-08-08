/**
 * Taska Pagination Dots Component
 *
 * Uses NativeWind design system tokens.
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';

interface PaginationDotsProps {
  count: number;
  activeIndex: number;
  style?: ViewStyle;
  testID?: string;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({
  count,
  activeIndex,
  style,
  testID,
}) => {
  return (
    <View
      className="flex-row items-center justify-center"
      style={style}
      testID={testID}
      accessible
      accessibilityLabel={`Page ${activeIndex + 1} of ${count}`}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={`dot-${index}`}
            className={[
              'h-2 rounded-full',
              isActive ? 'w-6 bg-primary' : 'w-2 bg-border',
            ].join(' ')}
            style={{ marginHorizontal: 4 }}
          />
        );
      })}
    </View>
  );
};

export default PaginationDots;
