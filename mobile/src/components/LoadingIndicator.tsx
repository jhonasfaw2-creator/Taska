import React from 'react';
import { View, ActivityIndicator, ViewStyle } from 'react-native';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  color,
  style,
}) => {
  return (
    <View className="items-center justify-center py-xl" style={style}>
      <ActivityIndicator
        size={size}
        color={color || '#2563EB'}
        testID="splash-loading-indicator"
      />
    </View>
  );
};

export default LoadingIndicator;
