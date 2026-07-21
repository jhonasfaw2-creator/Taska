import { useCallback, useMemo, useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';

// ── Types ────────────────────────────────────────────────────────────────────

type VehicleId = 'walking' | 'motorcycle' | 'car' | 'van' | 'truck';

interface VehicleOption {
  id: VehicleId;
  icon: string;
  name: string;
  description: string;
}

interface VehicleForm {
  vehicle: VehicleId | null;
  nickname: string;
  licensePlate: string;
  color: string;
  photo: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const VEHICLES: VehicleOption[] = [
  {
    id: 'walking',
    icon: '🚶',
    name: 'Walking',
    description: 'Small items, short distance',
  },
  {
    id: 'motorcycle',
    icon: '🏍',
    name: 'Motorcycle',
    description: 'Quick deliveries, light items',
  },
  {
    id: 'car',
    icon: '🚗',
    name: 'Car',
    description: 'Medium packages, groceries',
  },
  {
    id: 'van',
    icon: '🚐',
    name: 'Van',
    description: 'Large items, furniture',
  },
  {
    id: 'truck',
    icon: '🚚',
    name: 'Truck',
    description: 'Heavy cargo, bulk loads',
  },
];

const EMPTY_FORM: VehicleForm = {
  vehicle: null,
  nickname: '',
  licensePlate: '',
  color: '',
  photo: '',
};

// ── Screen Component ─────────────────────────────────────────────────────────

export default function VehicleRegistrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<VehicleForm>(EMPTY_FORM);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // ── Derived state ──────────────────────────────────────────────────────────

  const selectedVehicle = form.vehicle;
  const needsVehicleFields = selectedVehicle !== null && selectedVehicle !== 'walking';

  // ── Field updaters ─────────────────────────────────────────────────────────

  const updateField = useCallback(
    <K extends keyof VehicleForm>(field: K, value: VehicleForm[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const selectVehicle = useCallback((id: VehicleId) => {
    setForm((prev) => ({
      ...prev,
      vehicle: id,
      // Clear vehicle-specific fields when switching
      licensePlate: '',
      color: '',
      photo: '',
    }));
    setTouched((prev) => {
      const next = new Set(prev);
      next.delete('licensePlate');
      next.delete('color');
      next.delete('photo');
      return next;
    });
    // Mark vehicle as touched so validation triggers on Continue press
    setTouched((prev) => new Set(prev).add('vehicle'));
  }, []);

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const markAllTouched = useCallback(() => {
    const fields = ['vehicle'];
    if (needsVehicleFields) {
      fields.push('licensePlate', 'color', 'photo');
    }
    setTouched(new Set(fields));
  }, [needsVehicleFields]);

  // ── Validation ─────────────────────────────────────────────────────────────

  const isFormValid = useMemo(() => {
    if (selectedVehicle === null) return false;
    if (selectedVehicle === 'walking') return true;
    return (
      form.licensePlate.trim().length > 0 &&
      form.color.trim().length > 0 &&
      form.photo.trim().length > 0
    );
  }, [selectedVehicle, form]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleContinue = useCallback(() => {
    markAllTouched();
    if (!isFormValid) return;
    router.replace('/tasker-dashboard');
  }, [isFormValid, markAllTouched, router]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    fieldKey: string,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'phone-pad';
      autoComplete?: 'name' | 'tel';
    }
  ) => {
    const isFieldTouched = touched.has(fieldKey);
    const showError = isFieldTouched && value.trim().length === 0;

    return (
      <View className="pb-md">
        <Typography
          variant="caption"
          weight="medium"
          className="mb-xs px-xs uppercase tracking-wide text-text-secondary"
        >
          {label}
        </Typography>
        <View
          className={[
            'flex-row items-center rounded-xl border bg-surface px-md',
            showError ? 'border-red-500' : 'border-border',
          ].join(' ')}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onBlur={() => markTouched(fieldKey)}
            placeholder={options?.placeholder ?? `Enter ${label.toLowerCase()}`}
            placeholderTextColor="rgba(107, 114, 128, 0.5)"
            keyboardType={options?.keyboardType ?? 'default'}
            autoComplete={options?.autoComplete}
            returnKeyType="done"
            className="flex-1 py-md text-body text-text-primary"
            accessibilityLabel={label}
          />
          {isFieldTouched && value.trim().length > 0 && (
            <Typography variant="caption" className="text-green-500">
              ✓
            </Typography>
          )}
        </View>
        {showError && (
          <Typography variant="caption" className="mt-xs px-xs text-red-500">
            {label} is required.
          </Typography>
        )}
      </View>
    );
  };

  const renderVehicleCard = (vehicle: VehicleOption) => {
    const isSelected = selectedVehicle === vehicle.id;

    return (
      <TouchableOpacity
        key={vehicle.id}
        accessibilityRole="radio"
        accessibilityLabel={`${vehicle.name} — ${vehicle.description}`}
        accessibilityState={{ selected: isSelected }}
        onPress={() => selectVehicle(vehicle.id)}
        testID={`vehicle-card-${vehicle.id}`}
        activeOpacity={0.85}
        className={[
          'mb-sm rounded-xl border-2 px-md py-lg',
          isSelected
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface',
        ].join(' ')}
        style={
          isSelected
            ? {
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 4,
              }
            : {}
        }
      >
        <View className="flex-row items-center gap-md">
          {/* Icon */}
          <View
            className={[
              'h-12 w-12 items-center justify-center rounded-xl',
              isSelected ? 'bg-primary/20' : 'bg-primary/[0.06]',
            ].join(' ')}
          >
            <Typography variant="h2">{vehicle.icon}</Typography>
          </View>

          {/* Name + Description */}
          <View className="flex-1">
            <Typography
              variant="body"
              weight="semibold"
              className={isSelected ? 'text-primary' : 'text-text-primary'}
            >
              {vehicle.name}
            </Typography>
            <Typography variant="caption" color="secondary" className="mt-0.5">
              {vehicle.description}
            </Typography>
          </View>

          {/* Selection indicator */}
          <View
            className={[
              'h-6 w-6 items-center justify-center rounded-full border-2',
              isSelected
                ? 'border-primary bg-primary'
                : 'border-border',
            ].join(' ')}
          >
            {isSelected && (
              <Typography
                variant="caption"
                weight="bold"
                className="text-background"
                style={{ fontSize: 10, lineHeight: 14 }}
              >
                ✓
              </Typography>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderVehicleFields = () => {
    if (!selectedVehicle) return null;

    return (
      <View className="rounded-xl border border-border bg-surface p-md">
        {/* Section header */}
        <View className="mb-md flex-row items-center gap-sm">
          <View className="h-2 w-2 rounded-full bg-primary" />
          <Typography variant="caption" weight="semibold" className="uppercase tracking-wide text-primary">
            {selectedVehicle === 'walking' ? 'Details' : 'Vehicle Details'}
          </Typography>
        </View>

        {/* Nickname — available for all */}
        {renderInput(
          'Vehicle Nickname',
          form.nickname,
          (v) => updateField('nickname', v),
          'nickname',
          { placeholder: 'e.g. "My trusty sedan" (optional)' }
        )}

        {needsVehicleFields && (
          <>
            {renderInput(
              'License Plate Number',
              form.licensePlate,
              (v) => updateField('licensePlate', v),
              'licensePlate',
              { placeholder: 'e.g. ABC-1234' }
            )}

            {renderInput(
              'Vehicle Color',
              form.color,
              (v) => updateField('color', v),
              'color',
              { placeholder: 'e.g. White, Blue, Red' }
            )}

            {/* Vehicle photo upload */}
            <View className="pb-md">
              <Typography
                variant="caption"
                weight="medium"
                className="mb-xs px-xs uppercase tracking-wide text-text-secondary"
              >
                Vehicle Photo
              </Typography>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Upload vehicle photo"
                accessibilityHint="Tap to upload a photo of your vehicle"
                onPress={() => {
                  updateField('photo', 'uploaded');
                  markTouched('photo');
                }}
                className={[
                  'flex-row items-center justify-center rounded-xl border-2 py-lg',
                  form.photo.trim().length > 0
                    ? 'border-green-400 bg-green-50'
                    : 'border-dashed border-border bg-surface',
                ].join(' ')}
              >
                {form.photo.trim().length > 0 ? (
                  <View className="flex-row items-center gap-sm">
                    <Typography variant="body" className="text-green-600">
                      ✓
                    </Typography>
                    <Typography variant="body" weight="medium" className="text-green-600">
                      Photo uploaded
                    </Typography>
                  </View>
                ) : (
                  <View className="items-center gap-1">
                    <Typography variant="h2" className="text-text-secondary">
                      📸
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      Tap to upload vehicle photo
                    </Typography>
                  </View>
                )}
              </TouchableOpacity>
              {touched.has('photo') && form.photo.trim().length === 0 && (
                <Typography variant="caption" className="mt-xs px-xs text-red-500">
                  Vehicle photo is required.
                </Typography>
              )}
            </View>
          </>
        )}

        {/* Fields summary hint */}
        {!needsVehicleFields && (
          <View className="flex-row items-center gap-sm rounded-lg bg-primary/5 px-sm py-sm">
            <Typography variant="caption" className="text-text-secondary">
              💡 No additional vehicle details needed for walking.
            </Typography>
          </View>
        )}
      </View>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-screen-padding pt-md">
          {/* Back button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="vehicle-reg-back-button"
            className="mb-xl h-xl w-xl items-center justify-center rounded-full active:opacity-60"
            hitSlop={8}
          >
            <Typography variant="body" weight="medium" className="text-text-primary">
              ←
            </Typography>
          </TouchableOpacity>

          {/* Title */}
          <Typography variant="h2" weight="bold" className="text-text-primary">
            Vehicle Information
          </Typography>

          {/* Subtitle */}
          <View className="mt-sm">
            <Typography variant="body" color="secondary" className="leading-relaxed">
              Choose how you&apos;ll complete tasks.
            </Typography>
          </View>
        </View>

        {/* Vehicle selection */}
        <View className="px-screen-padding pt-lg">
          <Typography
            variant="caption"
            weight="semibold"
            className="mb-sm px-xs uppercase tracking-wide text-text-secondary"
          >
            Select your vehicle
          </Typography>

          {VEHICLES.map(renderVehicleCard)}

          {/* No selection error */}
          {touched.has('vehicle') && selectedVehicle === null && (
            <View className="px-xs pb-sm">
              <Typography variant="caption" className="text-red-500">
                Please select a vehicle to continue.
              </Typography>
            </View>
          )}
        </View>

        {/* Dynamic fields */}
        {selectedVehicle !== null && (
          <View className="px-screen-padding pt-md">
            {renderVehicleFields()}
          </View>
        )}

        {/* Spacer for bottom area */}
        <View className="h-16" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="border-t border-border bg-background px-screen-padding pb-xl pt-lg">
        <Button
          label={
            selectedVehicle === null
              ? 'Select a vehicle to continue'
              : `Continue with ${VEHICLES.find((v) => v.id === selectedVehicle)?.name ?? ''}`
          }
          radius="lg"
          shadow={isFormValid ? 'lg' : 'none'}
          disabled={!isFormValid}
          onPress={handleContinue}
          testID="vehicle-reg-continue"
        />
      </View>
    </View>
  );
}
