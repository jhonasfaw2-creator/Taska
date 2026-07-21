import { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { VEHICLES } from '@/data/vehicles';
import { applyAsTasker, refreshAccessToken, ApiError } from '@/services';

interface FormState {
  vehicleType: string | null;
  experience: string;
  bio: string;
}

interface FormErrors {
  vehicleType?: string;
}

export default function TaskerApplyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<FormState>({
    vehicleType: null,
    experience: '',
    bio: '',
  });
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(form, touched);
  const isValid = !errors.vehicleType && form.vehicleType !== null;

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setTouched(true);
    if (!isValid || !form.vehicleType || submitting) return;

    setSubmitting(true);
    try {
      await applyAsTasker({
        vehicleType: form.vehicleType.toUpperCase(),
        experience: form.experience ? Number(form.experience) : undefined,
        bio: form.bio.trim() || undefined,
      });

      // The user's role is now TASKER on the server. Refresh the access
      // token so subsequent tasker-only requests carry the new role.
      await refreshAccessToken();

      router.replace('/tasker-dashboard');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Could not submit your application. Please try again.';
      Alert.alert('Application failed', message);
    } finally {
      setSubmitting(false);
    }
  }, [isValid, form, router, submitting]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <ScreenHeader
          title="Tasker Application"
          subtitle="Tell us about yourself and how you'll get around."
        />

        <View className="flex-1 px-screen-padding pt-xl">
          {/* Vehicle type */}
          <Typography
            variant="caption"
            weight="semibold"
            className="mb-md uppercase tracking-wider text-text-secondary"
          >
            Vehicle Type *
          </Typography>
          {VEHICLES.map((v) => {
            const selected = form.vehicleType === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                accessibilityRole="radio"
                accessibilityLabel={v.name}
                accessibilityState={{ selected }}
                onPress={() => setField('vehicleType', v.id)}
                testID={`vehicle-${v.id}`}
                activeOpacity={0.8}
                className={[
                  'mb-sm flex-row items-center rounded-2xl border bg-surface px-lg py-md',
                  selected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border',
                ].join(' ')}
                style={selected ? { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 } : {}}
              >
                <View
                  className={[
                    'mr-md h-12 w-12 items-center justify-center rounded-full',
                    selected ? 'bg-primary/15' : 'bg-primary/5',
                  ].join(' ')}
                >
                  <Typography variant="h2">{v.icon}</Typography>
                </View>
                <View className="flex-1">
                  <Typography variant="body" weight="semibold" className="text-text-primary">
                    {v.name}
                  </Typography>
                  <Typography variant="caption" color="secondary" className="mt-0.5">
                    {v.description}
                  </Typography>
                </View>
                {selected && (
                  <View className="ml-sm h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Typography variant="caption" weight="bold" className="text-background" style={{ fontSize: 11 }}>
                      ✓
                    </Typography>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          {touched && errors.vehicleType && (
            <Typography variant="caption" className="mb-sm text-red-500">
              {errors.vehicleType}
            </Typography>
          )}

          {/* Experience (optional) */}
          <View className="pt-xl">
            <Typography
              variant="caption"
              weight="semibold"
              className="mb-sm uppercase tracking-wider text-text-secondary"
            >
              Experience (years) — Optional
            </Typography>
            <View className="rounded-2xl border border-border bg-surface px-md">
              <TextInput
                value={form.experience}
                onChangeText={(val) => setField('experience', val.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 3"
                placeholderTextColor="rgba(107, 114, 128, 0.5)"
                keyboardType="number-pad"
                returnKeyType="next"
                className="py-md text-body text-text-primary"
                testID="tasker-apply-experience"
                accessibilityLabel="Years of experience"
              />
            </View>
          </View>

          {/* Bio (optional) */}
          <View className="pt-xl">
            <Typography
              variant="caption"
              weight="semibold"
              className="mb-sm uppercase tracking-wider text-text-secondary"
            >
              Short Bio — Optional
            </Typography>
            <View className="rounded-2xl border border-border bg-surface px-md">
              <TextInput
                value={form.bio}
                onChangeText={(val) => setField('bio', val)}
                placeholder="Tell customers a little about yourself..."
                placeholderTextColor="rgba(107, 114, 128, 0.5)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                returnKeyType="done"
                className="min-h-[100px] py-md text-body text-text-primary"
                testID="tasker-apply-bio"
                accessibilityLabel="Short bio"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="gap-md border-t border-border bg-background px-screen-padding pb-xl pt-lg">
        <Button
          label={submitting ? 'Submitting…' : 'Submit Application'}
          radius="lg"
          shadow={isValid ? 'lg' : 'none'}
          disabled={!isValid || submitting}
          onPress={handleSubmit}
          testID="tasker-apply-submit"
        />
        <Button
          label="Back"
          variant="outline"
          radius="lg"
          onPress={() => router.back()}
          testID="tasker-apply-back"
        />
      </View>
    </View>
  );
}

function validate(form: FormState, touched: boolean): FormErrors {
  const errors: FormErrors = {};
  if (touched && !form.vehicleType) {
    errors.vehicleType = 'Please select a vehicle type.';
  }
  return errors;
}
