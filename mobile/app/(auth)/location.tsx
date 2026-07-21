import { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { useTaskContext } from '@/store/TaskContext';

interface LocationSectionProps {
  label: string;
  address: string;
  onAddressChange: (text: string) => void;
  onUseCurrent: () => void;
  onSelectSuggestion: (address: string) => void;
  selected: boolean;
}

function LocationSection({
  label,
  address,
  onAddressChange,
  onUseCurrent,
  onSelectSuggestion,
  selected,
}: LocationSectionProps) {
  const [searchQuery, setSearchQuery] = useState(address);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      onAddressChange(text);
      setIsSearching(text.length > 0);
    },
    [onAddressChange],
  );

  const mockSuggestions = [
    'Bole, Addis Ababa, Ethiopia',
    'Kazanchis, Addis Ababa, Ethiopia',
    'Piazza, Addis Ababa, Ethiopia',
    'Meskel Square, Addis Ababa, Ethiopia',
    'CMC, Addis Ababa, Ethiopia',
  ].filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

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
            accessibilityLabel={`Search ${label}`}
          />
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Use current location for ${label}`}
        onPress={onUseCurrent}
        className="mt-md flex-row items-center justify-center gap-sm rounded-xl border border-primary bg-primary/5 px-md py-md active:opacity-80"
      >
        <Typography variant="body" weight="medium" className="text-primary">
          📍
        </Typography>
        <Typography variant="body" weight="semibold" className="text-primary">
          Use Current Location
        </Typography>
      </TouchableOpacity>

      {isSearching && searchQuery.length > 0 && mockSuggestions.length > 0 && (
        <View className="mt-md overflow-hidden rounded-xl border border-border bg-surface">
          {mockSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Select ${suggestion}`}
              onPress={() => {
                onSelectSuggestion(suggestion);
                setSearchQuery(suggestion);
                setIsSearching(false);
              }}
              className={`flex-row items-center gap-md px-md py-md active:bg-primary/5 ${
                index === mockSuggestions.length - 1 ? '' : 'border-b border-border'
              }`}
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

      {selected && (
        <View className="mt-md rounded-xl border border-primary bg-primary/5 p-md">
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
                {label}
              </Typography>
              <Typography variant="body" className="mt-xs text-text-primary">
                {address}
              </Typography>
            </View>
          </View>
        </View>
      )}

      <View className="mt-md">
        <MapPlaceholder
          label={`${label} Map`}
          subtitle="Tap to select location. Map integration coming soon."
        />
      </View>
    </View>
  );
}

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setPickup, setDropoff } = useTaskContext();

  const [pickupAddress, setPickupAddress] = useState(state.pickup?.address ?? '');
  const [dropoffAddress, setDropoffAddress] = useState(state.dropoff?.address ?? '');

  const pickupSelected = pickupAddress.trim().length > 0;
  const dropoffSelected = dropoffAddress.trim().length > 0;
  const isValid = pickupSelected && dropoffSelected;

  const handleUseCurrentPickup = useCallback(() => {
    const addr = 'Current Location - Bole, Addis Ababa, Ethiopia';
    setPickupAddress(addr);
    setPickup({ address: addr, latitude: 9.03, longitude: 38.74 });
  }, [setPickup]);

  const handleUseCurrentDropoff = useCallback(() => {
    const addr = 'Current Location - Bole, Addis Ababa, Ethiopia';
    setDropoffAddress(addr);
    setDropoff({ address: addr, latitude: 9.02, longitude: 38.75 });
  }, [setDropoff]);

  const handleSelectPickup = useCallback(
    (address: string) => {
      setPickupAddress(address);
      setPickup({ address, latitude: 9.03, longitude: 38.74 });
    },
    [setPickup],
  );

  const handleSelectDropoff = useCallback(
    (address: string) => {
      setDropoffAddress(address);
      setDropoff({ address, latitude: 9.02, longitude: 38.75 });
    },
    [setDropoff],
  );

  const handlePickupChange = useCallback((text: string) => {
    setPickupAddress(text);
  }, []);

  const handleDropoffChange = useCallback((text: string) => {
    setDropoffAddress(text);
  }, []);

  const handleContinue = useCallback(() => {
    if (!isValid) return;
    if (pickupAddress && pickupAddress !== state.pickup?.address) {
      setPickup({ address: pickupAddress, latitude: 9.03, longitude: 38.74 });
    }
    if (dropoffAddress && dropoffAddress !== state.dropoff?.address) {
      setDropoff({ address: dropoffAddress, latitude: 9.02, longitude: 38.75 });
    }
    router.push('/upload-photos');
  }, [isValid, pickupAddress, dropoffAddress, state, setPickup, setDropoff, router]);

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
            address={pickupAddress}
            onAddressChange={handlePickupChange}
            onUseCurrent={handleUseCurrentPickup}
            onSelectSuggestion={handleSelectPickup}
            selected={pickupSelected}
          />

          <LocationSection
            label="Drop-off Location"
            address={dropoffAddress}
            onAddressChange={handleDropoffChange}
            onUseCurrent={handleUseCurrentDropoff}
            onSelectSuggestion={handleSelectDropoff}
            selected={dropoffSelected}
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
        />
        <Button
          label="Back"
          variant="outline"
          radius="lg"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
