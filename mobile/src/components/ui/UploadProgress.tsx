import React from 'react';
import { View, Text } from 'react-native';

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  showLabel?: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  fileName,
  showLabel = true,
}) => {
  const clamped = Math.min(Math.max(progress, 0), 100);
  const barWidth = `${clamped}%`;

  return (
    <View style={{ width: '100%' }}>
      {showLabel && fileName && (
        <Text
          style={{
            fontSize: 12,
            color: '#6B7280',
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {fileName}
        </Text>
      )}
      <View
        style={{
          height: 6,
          backgroundColor: '#E5E7EB',
          borderRadius: 3,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <View
          style={{
            height: 6,
            width: barWidth as any,
            backgroundColor: clamped === 100 ? '#22C55E' : '#4F46E5',
            borderRadius: 3,
          }}
        />
      </View>
      {showLabel && (
        <Text
          style={{
            fontSize: 11,
            color: '#9CA3AF',
            marginTop: 2,
            textAlign: 'right',
          }}
        >
          {clamped}%
        </Text>
      )}
    </View>
  );
};

export default UploadProgress;
