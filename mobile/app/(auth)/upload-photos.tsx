import { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button, Typography } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTaskContext } from '@/store/TaskContext';

const MAX_IMAGES = 5;
const ALLOWED_FORMATS = ['JPG', 'PNG', 'HEIC'];

export default function UploadPhotosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, addImages, removeImage } = useTaskContext();

  const images = state.images;
  const hasReachedLimit = images.length >= MAX_IMAGES;
  const remainingSlots = MAX_IMAGES - images.length;

  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions required',
          'We need camera and photo library access to add photos. Please enable them in your device settings.',
          [{ text: 'OK' }],
        );
        return false;
      }
      return true;
    }
    return true;
  }, []);

  const openCamera = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          id: `camera-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        }));
        addImages(newImages);
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  }, [requestPermissions, addImages]);

  const openGallery = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          id: `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        }));
        addImages(newImages);
      }
    } catch {
      Alert.alert('Error', 'Failed to load photos. Please try again.');
    }
  }, [requestPermissions, remainingSlots, addImages]);

  const showPickerOptions = useCallback(() => {
    Alert.alert('Choose Photos', 'Select a source', [
      { text: 'Camera', onPress: () => openCamera() },
      { text: 'Photo Library', onPress: () => openGallery() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [openCamera, openGallery]);

  const handleContinue = useCallback(() => {
    router.push('/vehicle-type');
  }, [router]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScreenHeader
        title="Add photos"
        subtitle="Photos help the tasker identify the item. This step is optional."
      />

      <View className="flex-1 px-screen-padding pt-xl">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Choose photos"
          accessibilityState={{ disabled: hasReachedLimit }}
          onPress={showPickerOptions}
          disabled={hasReachedLimit}
          testID="upload-photos-upload-area"
          className="items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-md py-xxl"
        >
          <View className="mb-md h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Icon name="camera" size={32} color="#2563EB" accessibilityLabel="Take photo" />
          </View>

          <Typography
            variant="body"
            weight="semibold"
            className="text-center text-text-primary"
          >
            {hasReachedLimit ? 'Maximum photos selected' : 'Tap to add photos'}
          </Typography>

          <View className="mt-xs">
            <Typography variant="caption" color="secondary" className="text-center">
              {hasReachedLimit
                ? `You've reached the ${MAX_IMAGES} photo limit`
                : `Choose up to ${remainingSlots} photo${remainingSlots !== 1 ? 's' : ''}`}
            </Typography>
          </View>
        </TouchableOpacity>

        {!hasReachedLimit && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Choose Photos"
            onPress={showPickerOptions}
            testID="upload-photos-choose-button"
            className="mt-md flex-row items-center justify-center gap-sm rounded-xl border border-primary bg-primary/5 px-md py-md active:opacity-80"
          >
            <Typography variant="body" weight="medium" className="text-primary">
              <Icon name="image" size={24} color="#2563EB" accessibilityLabel="Photos" />
            </Typography>
            <Typography variant="body" weight="semibold" className="text-primary">
              Choose Photos
            </Typography>
          </TouchableOpacity>
        )}

        {images.length > 0 && (
          <View className="mt-lg">
            <View className="mb-md flex-row items-center justify-between">
              <Typography
                variant="caption"
                weight="medium"
                className="uppercase tracking-wide text-text-secondary"
              >
                Selected photos ({images.length}/{MAX_IMAGES})
              </Typography>
            </View>

            <View className="flex-row flex-wrap" style={{ margin: -6 }}>
              {images.map((image) => (
                <View
                  key={image.id}
                  className="relative"
                  style={{ width: '33.333%', aspectRatio: 1, padding: 6 }}
                >
                  <Image
                    source={{ uri: image.uri }}
                    className="h-full w-full rounded-xl"
                    style={{
                      resizeMode: 'cover',
                      backgroundColor: '#F3F4F6',
                    }}
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                    onPress={() => removeImage(image.id)}
                    testID={`upload-photos-remove-${image.id}`}
                    className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-overlay active:opacity-70"
                  >
                    <Typography
                      variant="caption"
                      weight="bold"
                      className="text-background"
                      style={{ fontSize: 10, lineHeight: 14 }}
                    >
                      <Icon name="close" size={16} color="#FFFFFF" accessibilityLabel="Remove photo" />
                    </Typography>
                  </TouchableOpacity>
                </View>
              ))}

              {!hasReachedLimit && images.length < MAX_IMAGES && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Add more photos"
                  onPress={showPickerOptions}
                  style={{ width: '33.333%', aspectRatio: 1, padding: 6 }}
                  className="active:opacity-70"
                >
                  <View className="h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface">
                    <Typography variant="h2" className="text-text-secondary">
                      +
                    </Typography>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View className="mt-lg">
          <Typography variant="caption" color="secondary" className="text-center">
            Supported formats: {ALLOWED_FORMATS.join(', ')}
          </Typography>
        </View>
      </View>

      <View className="gap-md px-screen-padding pb-xl pt-lg">
        <Button
          label={
            images.length > 0
              ? `Continue with ${images.length} photo${images.length !== 1 ? 's' : ''}`
              : 'Continue without photos'
          }
          radius="lg"
          shadow="lg"
          onPress={handleContinue}
          testID="upload-photos-continue"
        />
        <Button
          label="Back"
          variant="outline"
          radius="lg"
          onPress={() => router.back()}
          testID="upload-photos-back-bottom"
        />
      </View>
    </ScrollView>
  );
}
