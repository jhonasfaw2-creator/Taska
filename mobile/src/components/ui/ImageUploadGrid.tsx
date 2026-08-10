import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, ScrollView } from 'react-native';
import { ImagePreview } from './ImagePreview';
import { UploadProgress } from './UploadProgress';
import { Icon } from '@/components/Icon';
import type { ImagePickerAsset, UploadProgress as UploadProgressType } from '../../types/media';

interface ImageUploadGridProps {
  assets: ImagePickerAsset[];
  onAddFromGallery: () => void;
  onTakePhoto: () => void;
  onRemoveAsset: (index: number) => void;
  onUpload: () => void;
  uploading?: boolean;
  uploadProgress?: UploadProgressType | null;
  maxCount: number;
  uploadLabel?: string;
}

export const ImageUploadGrid: React.FC<ImageUploadGridProps> = ({
  assets,
  onAddFromGallery,
  onTakePhoto,
  onRemoveAsset,
  onUpload,
  uploading = false,
  uploadProgress,
  maxCount,
  uploadLabel = 'Upload',
}) => {
  const canAddMore = assets.length < maxCount;
  const hasAssets = assets.length > 0;
  const gridSize = 80;

  return (
    <View style={{ width: '100%' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8 }}>
          {assets.map((asset, index) => (
            <ImagePreview
              key={`${asset.uri}-${index}`}
              uri={asset.uri}
              onRemove={() => onRemoveAsset(index)}
              size={gridSize}
            />
          ))}

          {canAddMore && !uploading && (
            <View style={{ gap: 4 }}>
              <TouchableOpacity
                onPress={onAddFromGallery}
                style={{
                  width: gridSize,
                  height: gridSize,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: '#D1D5DB',
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F9FAFB',
                }}
                accessibilityLabel="Add from gallery"
                accessibilityRole="button"
              >
                <Icon name="plus" size={24} color="#9CA3AF" accessibilityLabel="Add from gallery" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onTakePhoto}
                style={{
                  width: gridSize,
                  height: gridSize,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: '#D1D5DB',
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F9FAFB',
                }}
                accessibilityLabel="Take a photo"
                accessibilityRole="button"
              >
                <Text style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 14 }}>
                  <Icon name="camera" size={24} color="#9CA3AF" accessibilityLabel="Take a photo" />
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {uploadProgress && (
        <View style={{ paddingVertical: 8 }}>
          <UploadProgress progress={uploadProgress.percentage} fileName="Uploading..." />
        </View>
      )}

      {uploading && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
          }}
        >
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={{ marginLeft: 8, color: '#6B7280', fontSize: 14 }}>Uploading...</Text>
        </View>
      )}

      {hasAssets && !uploading && (
        <TouchableOpacity
          onPress={onUpload}
          disabled={uploading}
          style={{
            backgroundColor: '#2563EB',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 8,
            opacity: uploading ? 0.6 : 1,
          }}
          accessibilityLabel={uploadLabel}
          accessibilityRole="button"
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
            {uploadLabel} ({assets.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ImageUploadGrid;
