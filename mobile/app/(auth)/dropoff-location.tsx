import { useCallback, useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';

export default function DropoffLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const hasLocation = selectedAddress !== null;

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setIsSearching(text.length > 0);
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    setSelectedAddress('Current Location - Bole, Addis Ababa, Ethiopia');
    setSearchQuery('Bole, Addis Ababa');
    setIsSearching(false);
  }, []);

  const handleSelectLocation = useCallback((address: string) => {
    setSelectedAddress(address);
    setSearchQuery(address);
    setIsSearching(false);
  }, []);

  const handleContinue = useCallback(() => {
    if (!hasLocation) return;
    router.back();
  }, [hasLocation, router]);

  const mockSuggestions = [
    'Bole, Addis Ababa, Ethiopia',
    'Kazanchis, Addis Ababa, Ethiopia',
    'Piazza, Addis Ababa, Ethiopia',
    'Meskel Square, Addis Ababa, Ethiopia',
    'CMC, Addis Ababa, Ethiopia',
  ].filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

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
        {/* Header */}
        <View className="px-screen-padding pt-lg">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            testID="dropoff-back-button"
            onPress={() => router.back()}
            className="mb-lg h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
            hitSlop={8}
          >
            <Typography variant="body" weight="medium" className="text-text-primary">
              ←
            </Typography>
          </TouchableOpacity>

          <Typography variant="h1" weight="bold" className="text-text-primary">
            Drop-off location
          </Typography>
          <View className="h-sm" />
          <Typography variant="body" color="secondary">
            Where should the task be completed?
          </Typography>
        </View>

        {/* Search + map area */}
        <View className="flex-1 px-screen-padding pt-xl">
          {/* Search input */}
          <View className="overflow-hidden rounded-xl border border-border bg-surface">
            <View className="flex-row items-center px-md">
              <Typography variant="body" color="secondary" className="mr-md">
                🔍
              </Typography>
              <TextInput
                value={searchQuery}
                onChangeText={handleSearchChange}
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
            </View>
          </View>

          {/* Use Current Location */}
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

          {/* Suggestions */}
          {isSearching && searchQuery.length > 0 && mockSuggestions.length > 0 && (
            <View className="mt-md overflow-hidden rounded-xl border border-border bg-surface">
              {mockSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${suggestion}`}
                  onPress={() => handleSelectLocation(suggestion)}
                  testID={`dropoff-suggestion-${index}`}
                  className={[
                    'flex-row items-center gap-md px-md py-md active:bg-primary/5',
                    index === mockSuggestions.length - 1 ? '' : 'border-b border-border',
                  ].join(' ')}
                >
                  <Typography variant="body" color="secondary">
                    📍
                  </Typography>
                  <Typography variant="body" className="flex-1 text-text-primary">
                    {suggestion}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Map placeholder */}
          <View className="mt-lg min-h-[280px] flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
            <View className="flex-1 items-center justify-center px-md">
              <View className="items-center gap-md opacity-50">
                <Typography variant="h2" weight="bold" className="text-text-secondary">
                  🗺️
                </Typography>
                <Typography variant="body" color="secondary" className="text-center">
                  Interactive Map
                </Typography>
                <Typography variant="caption" color="secondary" className="text-center">
                  Tap to select drop-off location. Map integration coming soon.
                </Typography>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom: selected address + Continue */}
      <View className="px-screen-padding pb-xl pt-lg">
        {hasLocation && (
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
                <Typography variant="body" className="mt-xs text-text-primary">
                  {selectedAddress}
                </Typography>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Clear drop-off location"
                onPress={() => {
                  setSelectedAddress(null);
                  setSearchQuery('');
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
          shadow={hasLocation ? 'lg' : 'none'}
          disabled={!hasLocation}
          onPress={handleContinue}
          testID="dropoff-continue"
        />
      </View>
    </View>
  );
}
