import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import type { ImagePickerAsset, MediaFolder } from '../types/media';
import { MAX_FILES_PER_FOLDER } from '../types/media';

interface UseImagePickerOptions {
  allowsMultipleSelection?: boolean;
  maxSelection?: number;
}

interface UseImagePickerResult {
  assets: ImagePickerAsset[];
  pickFromGallery: () => Promise<void>;
  takePhoto: () => Promise<void>;
  removeAsset: (index: number) => void;
  clearAssets: () => void;
  isLoading: boolean;
  error: string | null;
}

async function requestPermission(type: 'camera' | 'gallery'): Promise<boolean> {
  if (type === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Needed',
        'Please enable camera access in Settings to take photos.',
      );
      return false;
    }
    return true;
  }

  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Gallery Permission Needed',
        'Please enable photo library access in Settings to select images.',
      );
      return false;
    }
  }
  return true;
}

export function useImagePicker(
  folder: MediaFolder,
  options: UseImagePickerOptions = {},
): UseImagePickerResult {
  const [assets, setAssets] = useState<ImagePickerAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxSelection = options.maxSelection ?? MAX_FILES_PER_FOLDER[folder] ?? 5;

  const processResult = useCallback(
    (result: ImagePicker.ImagePickerSuccessResult) => {
      const selected = result.assets.map((a) => ({
        uri: a.uri,
        width: a.width,
        height: a.height,
        mimeType: a.mimeType,
        fileSize: a.fileSize,
        fileName: a.fileName,
      }));

      const remaining = maxSelection - assets.length;
      if (selected.length > remaining) {
        Alert.alert('Limit Reached', `You can only select up to ${maxSelection} images.`);
      }

      setAssets((prev) => [...prev, ...selected.slice(0, remaining)].slice(0, maxSelection));
      setError(null);
    },
    [assets.length, maxSelection],
  );

  const pickFromGallery = useCallback(async () => {
    const hasPermission = await requestPermission('gallery');
    if (!hasPermission) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: options.allowsMultipleSelection ?? maxSelection > 1,
        quality: 0.8,
        selectionLimit: maxSelection - assets.length,
      });

      if (!result.canceled) {
        processResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open gallery.');
    } finally {
      setIsLoading(false);
    }
  }, [options.allowsMultipleSelection, maxSelection, assets.length, processResult]);

  const takePhoto = useCallback(async () => {
    const hasPermission = await requestPermission('camera');
    if (!hasPermission) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        processResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open camera.');
    } finally {
      setIsLoading(false);
    }
  }, [processResult]);

  const removeAsset = useCallback((index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAssets = useCallback(() => {
    setAssets([]);
    setError(null);
  }, []);

  return {
    assets,
    pickFromGallery,
    takePhoto,
    removeAsset,
    clearAssets,
    isLoading,
    error,
  };
}
