import { useCallback } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTaskContext } from '@/store/TaskContext';
import { VEHICLES } from '@/data/vehicles';

export default function VehicleTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setVehicleType } = useTaskContext();

  const selectedVehicle = state.vehicleType;

  const handleSelect = useCallback(
    (id: string) => {
      setVehicleType(id);
    },
    [setVehicleType],
  );

  const handleContinue = useCallback(() => {
    router.push('/review-task');
  }, [router]);

  const handleSkip = useCallback(() => {
    setVehicleType(null);
    router.push('/review-task');
  }, [setVehicleType, router]);

  const selectedName = selectedVehicle
    ? VEHICLES.find((v) => v.id === selectedVehicle)?.name ?? ''
    : '';

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
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Choose a vehicle"
          subtitle="Select the vehicle best suited for your task, or skip if not needed."
        />

        <View className="flex-1 px-screen-padding pt-lg">
          {VEHICLES.map((vehicle) => {
            const isSelected = selectedVehicle === vehicle.id;

            return (
              <TouchableOpacity
                key={vehicle.id}
                accessibilityRole="radio"
                accessibilityLabel={`${vehicle.name} - ${vehicle.description}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleSelect(vehicle.id)}
                testID={`vehicle-type-card-${vehicle.id}`}
                activeOpacity={0.9}
                className={`mb-md overflow-hidden rounded-2xl border-2 ${
                  isSelected
                    ? 'border-primary bg-primary/[0.08]'
                    : 'border-border bg-surface'
                }`}
                style={
                  isSelected
                    ? {
                        shadowColor: '#4F46E5',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        elevation: 6,
                      }
                    : {}
                }
              >
                {isSelected && <View className="h-1 w-full bg-primary" />}

                <View className="flex-row items-center px-lg py-lg">
                  <View
                    className={`h-14 w-14 items-center justify-center rounded-2xl ${
                      isSelected ? 'bg-primary/10' : 'bg-primary/[0.06]'
                    }`}
                  >
                    <Typography
                      variant="h1"
                      className={isSelected ? '' : 'opacity-80'}
                    >
                      {vehicle.icon}
                    </Typography>
                  </View>

                  <View className="ml-md flex-1">
                    <View className="flex-row items-center gap-sm">
                      <Typography
                        variant="body"
                        weight="semibold"
                        className={`text-text-primary ${
                          isSelected ? 'text-primary' : ''
                        }`}
                      >
                        {vehicle.name}
                      </Typography>

                      {isSelected && (
                        <View className="rounded-full bg-primary/10 px-sm py-px">
                          <Typography
                            variant="caption"
                            weight="semibold"
                            className="text-primary"
                          >
                            Selected
                          </Typography>
                        </View>
                      )}
                    </View>

                    <View className="mt-1 flex-row items-center gap-xs">
                      <View className="h-1 w-1 rounded-full bg-text-secondary" />
                      <Typography variant="caption" color="secondary" className="flex-1">
                        {vehicle.description}
                      </Typography>
                    </View>

                    <View className="mt-1.5">
                      <Typography variant="caption" color="secondary" className="leading-snug">
                        {vehicle.recommendedFor}
                      </Typography>
                    </View>
                  </View>

                  <View
                    className={`ml-sm h-7 w-7 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-primary bg-primary' : 'border-border'
                    }`}
                  >
                    {isSelected && (
                      <Typography
                        variant="caption"
                        weight="bold"
                        className="text-background"
                        style={{ fontSize: 11, lineHeight: 14 }}
                      >
                        ✓
                      </Typography>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View className="gap-md border-t border-border bg-background px-screen-padding pb-xl pt-lg">
        <Button
          label={
            selectedVehicle
              ? `Continue with ${selectedName}`
              : 'Select a vehicle to continue'
          }
          radius="lg"
          shadow={selectedVehicle ? 'lg' : 'none'}
          disabled={!selectedVehicle}
          onPress={handleContinue}
          testID="vehicle-type-continue"
        />

        <Button
          label="Skip — I'll decide later"
          variant="outline"
          radius="lg"
          onPress={handleSkip}
          testID="vehicle-type-skip"
        />
      </View>
    </View>
  );
}
