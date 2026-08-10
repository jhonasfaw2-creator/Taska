import { useCallback, useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTaskContext } from '@/store/TaskContext';
import { searchAddresses, reverseGeocode } from '@/modules/location/services/geocoding.service';
import { getCurrentPosition } from '@/modules/location/services/location.service';
import LocationMap from '@/modules/location/components/LocationMap';
import type { GeocodingSuggestion } from '@/modules/location/services/geocoding.service';

interface LocationSectionProps {
  label: string;
  type: 'pickup' | 'dropoff';
  address: string;
  location: { latitude: number; longitude: number; address: string } | null;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  onClear: () => void;
}

function LocationSection({
  label,
  type,
  address,
  location,
  onLocationSelect,
  onClear,
}: LocationSectionProps) {
  const [searchQuery, setSearchQuery] = useState(address);
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const results = await searchAddresses(text, 5);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleChangeText = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        handleSearch(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: GeocodingSuggestion) => {
      setSearchQuery(suggestion.displayName);
      setSuggestions([]);
      onLocationSelect({
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        address: suggestion.displayName,
      });
    },
    [onLocationSelect],
  );

  const handleUseCurrent = useCallback(async () => {
    setSearchLoading(true);
    try {
      const position = await getCurrentPosition();
      const result = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      const loc = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: result.displayName,
      };
      setSearchQuery(result.displayName);
      onLocationSelect(loc);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to get current location');
    } finally {
      setSearchLoading(false);
    }
  }, [onLocationSelect]);

  return (
    <View className="mb-xl">
      <Typography
        variant="body"
        weight="semibold"
        className="mb-md text-text-primary"
      >
        {label}
      </Typography>

      <View className="overflow-hidden rounded-xl border border-border bg-surface">
        <View className="flex-row items-center px-md">
          <Typography variant="body" color="secondary" className="mr-md">
            <Icon name="search" size={20} color="#6B7280" accessibilityLabel="Search" />
          </Typography>
          <TextInput
            value={searchQuery}
            onChangeText={handleChangeText}
            placeholder="Search for a location"
            placeholderTextColor="rgba(107, 114, 128, 0.5)"
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            returnKeyType="search"
            className="flex-1 py-md text-body text-text-primary"
            accessibilityLabel={`Search ${label}`}
            testID={`${type}-search-input`}
          />
          {searchLoading && (
            <View className="h-4 w-4 items-center justify-center">
              <ActivityIndicator size="small" color="#2563EB" />
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Use current location for ${label}`}
        onPress={handleUseCurrent}
        testID={`${type}-current-location`}
        className="mt-md flex-row items-center justify-center gap-sm rounded-xl border border-primary bg-primary/5 px-md py-md active:opacity-80"
      >
        <Typography variant="body" weight="medium" className="text-primary">
          <Icon name="mapPin" size={20} color="#2563EB" accessibilityLabel="Location" />
        </Typography>
        <Typography variant="body" weight="semibold" className="text-primary">
          Use Current Location
        </Typography>
      </TouchableOpacity>

      {suggestions.length > 0 && (
        <View className="mt-md overflow-hidden rounded-xl border border-border bg-surface">
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={suggestion.placeId}
              accessibilityRole="button"
              accessibilityLabel={`Select ${suggestion.displayName}`}
              onPress={() => handleSelectSuggestion(suggestion)}
              testID={`${type}-suggestion-${index}`}
              className={`flex-row items-center gap-md px-md py-md active:bg-primary/5 ${
                index === suggestions.length - 1 ? '' : 'border-b border-border'
              }`}
            >
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Typography variant="caption" className="text-primary">
                  <Icon name="mapPin" size={16} color="#2563EB" accessibilityLabel="Location" />
                </Typography>
              </View>
              <View className="flex-1">
                <Typography variant="body" className="text-text-primary" numberOfLines={1}>
                  {suggestion.displayName}
                </Typography>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {location && (
        <View className="mt-md rounded-xl border border-primary bg-primary/5 p-md">
          <View className="flex-row items-start gap-md">
            <Typography variant="body" className="mt-1 text-primary">
              <Icon name="mapPin" size={20} color="#2563EB" accessibilityLabel="Location" />
            </Typography>
            <View className="flex-1">
              <Typography
                variant="caption"
                weight="medium"
                className="uppercase tracking-wide text-primary"
              >
                {label}
              </Typography>
              <Typography variant="body" className="mt-xs text-text-primary" numberOfLines={2}>
                {location.address}
              </Typography>
              <Typography variant="caption" color="secondary">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Typography>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Clear ${label}`}
              onPress={onClear}
              testID={`${type}-clear-location`}
              className="p-1 active:opacity-60"
            >
              <Typography variant="body" color="secondary">
                <Icon name="close" size={16} color="#6B7280" accessibilityLabel="Clear" />
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {location && (
        <View className="mt-md">
          <LocationMap
            userLocation={null}
            pickupLocation={type === 'pickup' ? { latitude: location.latitude, longitude: location.longitude } : undefined}
            dropoffLocation={type === 'dropoff' ? { latitude: location.latitude, longitude: location.longitude } : undefined}
            style={{ minHeight: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}
          />
        </View>
      )}
    </View>
  );
}

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setPickup, setDropoff } = useTaskContext();

  const [pickupLocation, setPickupLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(
    state.pickup ? { latitude: state.pickup.latitude, longitude: state.pickup.longitude, address: state.pickup.address } : null,
  );
  const [dropoffLocation, setDropoffLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(
    state.dropoff ? { latitude: state.dropoff.latitude, longitude: state.dropoff.longitude, address: state.dropoff.address } : null,
  );

  const isValid = !!pickupLocation && !!dropoffLocation;

  const handlePickupSelect = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      setPickupLocation(location);
      setPickup(location);
    },
    [setPickup],
  );

  const handleDropoffSelect = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      setDropoffLocation(location);
      setDropoff(location);
    },
    [setDropoff],
  );

  const handlePickupClear = useCallback(() => {
    setPickupLocation(null);
  }, []);

  const handleDropoffClear = useCallback(() => {
    setDropoffLocation(null);
  }, []);

  const handleContinue = useCallback(() => {
    if (!isValid) return;
    router.push('/upload-photos');
  }, [isValid, router]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <ScreenHeader
          title="Location"
          subtitle="Enter pickup and drop-off locations for your task."
        />

        <View className="flex-1 px-screen-padding pt-xl">
          <LocationSection
            label="Pickup Location"
            type="pickup"
            address={pickupLocation?.address ?? ''}
            location={pickupLocation}
            onLocationSelect={handlePickupSelect}
            onClear={handlePickupClear}
          />

          <LocationSection
            label="Drop-off Location"
            type="dropoff"
            address={dropoffLocation?.address ?? ''}
            location={dropoffLocation}
            onLocationSelect={handleDropoffSelect}
            onClear={handleDropoffClear}
          />
        </View>
      </ScrollView>

      <View className="gap-md border-t border-border bg-background px-screen-padding pb-xl pt-lg">
        <Button
          label="Continue"
          radius="lg"
          shadow={isValid ? 'lg' : 'none'}
          disabled={!isValid}
          onPress={handleContinue}
          testID="location-continue"
        />
        <Button
          label="Back"
          variant="outline"
          radius="lg"
          onPress={() => router.back()}
          testID="location-back"
        />
      </View>
    </View>
  );
}
