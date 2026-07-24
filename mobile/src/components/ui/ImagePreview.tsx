import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';

interface ImagePreviewProps {
  uri: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  size?: number;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  uri,
  onRemove,
  showRemoveButton = true,
  size = 80,
}) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      {showRemoveButton && onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          accessibilityLabel="Remove image"
          accessibilityRole="button"
        >
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', lineHeight: 14 }}>
            ×
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ImagePreview;
