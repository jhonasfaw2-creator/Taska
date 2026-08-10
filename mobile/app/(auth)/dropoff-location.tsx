import { useCallback, useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';
import { useTaskContext } from '@/store/TaskContext';
import { searchAddresses, reverseGeocode } from '@/modules/location/services/geocoding.service';
import { getCurrentPosition } from '@/modules/location/services/location.service';
import LocationMap from '@/modules/location/components/LocationMap';
import type { GeocodingSuggestion } from '@/modules/location/services/geocoding.service';

export default function DropoffLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setDropoff } = useTaskContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);

  const handleSearch = useCallback(async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchAddresses(text, 5);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
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
      const location = {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        address: suggestion.displayName,
      };
      setSelectedLocation(location);
      setDropoff(location);
    },
    [setDropoff],
  );

  const handleUseCurrentLocation = useCallback(async () => {
    setLoading(true);
    try {
      const position = await getCurrentPosition();
      const result = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: result.displayName,
      };
      setSelectedLocation(location);
      setSearchQuery(result.displayName);
      setDropoff(location);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to get current location');
    } finally {
      setLoading(false);
    }
  }, [setDropoff]);

  const handleContinue = useCallback(() => {
    if (!selectedLocation) return;
    router.push('/vehicle-type');
  }, [selectedLocation, router]);

  const canContinue = !!selectedLocation;

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
        <View className="border-b border-border bg-background px-screen-padding pb-lg pt-sm">
          <View className="flex-row items-center">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              testID="dropoff-back"
              onPress={() => router.back()}
              className="mr-sm h-10 w-10 items-center justify-center rounded-xl active:opacity-60"
              hitSlop={8}
            >
              <ArrowLeft size={24} className="text-text-primary" />
            </TouchableOpacity>
            <View className="flex-1">
              <Typography variant="h3" weight="bold" className="text-text-primary">
                Drop-off location
              </Typography>
              <Typography variant="caption" color="secondary">
                Where should the task be completed?
              </Typography>
            </View>
          </View>
        </View>

        <View className="flex-1 px-screen-padding pt-xl">
          <View className="overflow-hidden rounded-xl border border-border bg-surface">
            <View className="flex-row items-center px-md">
              <Typography variant="body" color="secondary" className="mr-md">
                🔍
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
                accessibilityLabel="Search location"
                testID="dropoff-search-input"
              />
              {loading && (
                <View className="h-4 w-4 items-center justify-center">
                  <View className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Use current location"
            onPress={handleUseCurrentLocation}
            testID="dropoff-current-location"
            className="mt-md flex-row items-center justify-center gap-sm rounded-xl border border-primary bg-primary/5 px-md py-md active:opacity-80"
          >
            <Typography variant="body" weight="medium" className="text-primary">
              📍
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
                  testID={`dropoff-suggestion-${index}`}
                  className={[
                    'flex-row items-center gap-md px-md py-md active:bg-primary/5',
                    index === suggestions.length - 1 ? '' : 'border-b border-border',
                  ].join(' ')}
                >
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Typography variant="caption" className="text-primary">
                      📍
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

          {selectedLocation && (
            <View className="mt-md">
              <LocationMap
                userLocation={null}
                dropoffLocation={{ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }}
                style={{ minHeight: 240, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-screen-padding pb-xl pt-lg">
        {selectedLocation && (
          <View className="mb-md rounded-xl border border-primary bg-primary/5 p-md">
            <View className="flex-row items-start gap-md">
              <Typography variant="body" className="mt-1 text-primary">
                📍
              </Typography>
              <View className="flex-1">
                <Typography
                  variant="caption"
                  weight="medium"
                  className="uppercase tracking-wide text-primary"
                >
                  Drop-off Location
                </Typography>
                <Typography variant="body" className="mt-xs text-text-primary" numberOfLines={2}>
                  {selectedLocation.address}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </Typography>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Clear drop-off location"
                onPress={() => {
                  setSelectedLocation(null);
                  setSearchQuery('');
                  setDropoff(null as any);
                }}
                testID="dropoff-clear-location"
                className="p-1 active:opacity-60"
              >
                <Typography variant="body" color="secondary">
                  ✕
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Button
          label="Continue"
          radius="lg"
          shadow={canContinue ? 'lg' : 'none'}
          disabled={!canContinue}
          onPress={handleContinue}
          testID="dropoff-continue"
        />
      </View>
    </View>
  );
}
