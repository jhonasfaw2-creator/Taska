import { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Typography } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { searchAddresses } from '../services/geocoding.service';
import type { GeocodingSuggestion } from '../services/geocoding.service';

export interface LocationSearchProps {
  onSelect: (suggestion: GeocodingSuggestion) => void;
  placeholder?: string;
  testID?: string;
}

export default function LocationSearch({
  onSelect,
  placeholder = 'Search for a location',
  testID,
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSearch = useCallback(
    async (text: string) => {
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
    },
    [],
  );

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
    }
  }, []);

  const handleSelect = useCallback(
    (suggestion: GeocodingSuggestion) => {
      setQuery(suggestion.displayName);
      setSuggestions([]);
      Keyboard.dismiss();
      onSelect(suggestion);
    },
    [onSelect],
  );

  const handleUseCurrentLocation = useCallback(() => {
    router.push('/(auth)/location');
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        handleSearch(query);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-screen-padding pt-lg">
        <Input
          variant="search"
          value={query}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="search"
          accessibilityLabel="Search location"
          testID={testID}
          helperText={loading ? 'Searching nearby locations...' : undefined}
        />

        {suggestions.length > 0 && (
          <View className="mt-md overflow-hidden rounded-xl border border-border bg-surface">
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion.placeId}
                accessibilityRole="button"
                accessibilityLabel={`Select ${suggestion.displayName}`}
                onPress={() => handleSelect(suggestion)}
                testID={`location-suggestion-${index}`}
                className={[
                  'flex-row items-center gap-md px-md py-md active:bg-primary/5',
                  index === suggestions.length - 1 ? '' : 'border-b border-border',
                ].join(' ')}
              >
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Icon name="mapPin" size={16} color="#2563EB" />
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

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Use current location"
          onPress={handleUseCurrentLocation}
          testID="use-current-location"
          className="mt-md flex-row items-center justify-center gap-sm rounded-xl border border-primary bg-primary/5 px-md py-md active:opacity-80"
        >
          <Icon name="mapPin" size={20} color="#2563EB" />
          <Typography variant="body" weight="semibold" className="text-primary">
            Use Current Location
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}
