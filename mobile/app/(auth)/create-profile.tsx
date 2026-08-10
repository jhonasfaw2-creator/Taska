import { useCallback, useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';
import { updateProfile, clearSession, ApiError } from '@/services';

type AccountType = 'customer' | 'tasker';

function formatPhone(raw: string): string {
  if (raw.startsWith('+251')) return raw.replace('+251', '+251 ');
  return raw;
}

export default function CreateProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone ?? '';
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const trimmedName = fullName.trim();
  const isNameEmpty = trimmedName.length === 0;
  const showNameError = nameTouched && isNameEmpty;
  const isValid = !isNameEmpty && accountType !== null;

  const handleNameChange = useCallback((text: string) => {
    setFullName(text);
  }, []);

  const handleNameBlur = useCallback(() => {
    setNameTouched(true);
  }, []);

  const handleSelectAccountType = useCallback((type: AccountType) => {
    setAccountType(type);
  }, []);

  const handleContinue = useCallback(async () => {
    setNameTouched(true);
    if (!isValid || saving) return;

    setSaving(true);
    try {
      await updateProfile({ firstName: trimmedName });
      if (accountType === 'customer') {
        router.push('/customer-home');
      } else {
        router.push('/tasker-setup');
      }
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        await clearSession();
        router.replace('/(auth)/welcome');
        return;
      }
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [isValid, saving, trimmedName, accountType, router]);

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
        <View className="px-screen-padding pt-md">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="profile-back-button"
            className="mb-xl h-xl w-xl items-center justify-center rounded-full active:opacity-60"
            hitSlop={8}
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            Create your profile
          </Typography>

          <View className="mt-sm">
            <Typography variant="body" color="secondary" className="leading-relaxed">
              Tell us a little about yourself.
            </Typography>
          </View>
        </View>

        <View className="flex-1 px-screen-padding pt-xl">
          <View className="items-center pb-lg">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Add profile photo"
              accessibilityHint="Photo upload coming soon"
              testID="profile-photo"
              className="h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-surface active:opacity-70"
              disabled
            >
              <Typography variant="h2" className="text-text-secondary">
                📷
              </Typography>
            </TouchableOpacity>
            <View className="mt-sm">
              <Typography variant="caption" color="secondary" className="text-center">
                Add a profile photo
              </Typography>
            </View>
          </View>

          <View className="pb-lg">
            <Typography
              variant="caption"
              weight="medium"
              className="mb-xs px-xs uppercase tracking-wide text-text-secondary"
            >
              Full name
            </Typography>
            <View
              className={[
                'flex-row items-center rounded-xl border bg-surface px-md',
                showNameError ? 'border-error' : 'border-border',
              ].join(' ')}
            >
              <TextInput
                value={fullName}
                onChangeText={handleNameChange}
                onBlur={handleNameBlur}
                placeholder="Enter your full name"
                placeholderTextColor="rgba(107, 114, 128, 0.5)"
                autoComplete="name"
                textContentType="name"
                returnKeyType="done"
                testID="profile-name-input"
                nativeID="full-name"
                className="flex-1 py-md text-body text-text-primary"
                accessibilityLabel="Full name"
              />
            </View>
            {showNameError && (
              <View className="mt-xs px-xs">
                <Typography variant="caption" className="text-error">
                  Please enter your full name.
                </Typography>
              </View>
            )}
          </View>

          <View className="pb-lg">
            <Typography
              variant="caption"
              weight="medium"
              className="mb-xs px-xs uppercase tracking-wide text-text-secondary"
            >
              Phone number
            </Typography>
            <View className="flex-row items-center rounded-xl border border-border bg-surface px-md opacity-70">
              <Typography variant="body" className="flex-1 py-md text-text-primary">
                {phone ? formatPhone(phone) : 'Not available'}
              </Typography>
              <View className="ml-sm">
                <Typography variant="caption" className="text-text-secondary">
                  Verified ✓
                </Typography>
              </View>
            </View>
          </View>

          <View className="pb-lg">
            <Typography
              variant="caption"
              weight="medium"
              className="mb-sm px-xs uppercase tracking-wide text-text-secondary"
            >
              I want to
            </Typography>

            <View className="gap-sm">
              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityLabel="Customer - Post tasks and hire taskers"
                accessibilityState={{ selected: accountType === 'customer' }}
                onPress={() => handleSelectAccountType('customer')}
                testID="profile-account-customer"
                className={[
                  'rounded-xl border-2 px-md py-lg',
                  accountType === 'customer'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface',
                ].join(' ')}
              >
                <View className="flex-row items-center gap-md">
                  <View
                    className={[
                      'h-6 w-6 items-center justify-center rounded-full border-2',
                      accountType === 'customer'
                        ? 'border-primary bg-primary'
                        : 'border-border',
                    ].join(' ')}
                  >
                    {accountType === 'customer' && (
                      <Typography variant="caption" weight="bold" className="text-background">
                        ✓
                      </Typography>
                    )}
                  </View>
                  <View className="flex-1">
                    <Typography variant="body" weight="semibold" className="text-text-primary">
                      Customer
                    </Typography>
                    <Typography variant="caption" color="secondary" className="mt-xs">
                      Post tasks and hire trusted taskers
                    </Typography>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityLabel="Tasker - Complete tasks and earn money"
                accessibilityState={{ selected: accountType === 'tasker' }}
                onPress={() => handleSelectAccountType('tasker')}
                testID="profile-account-tasker"
                className={[
                  'rounded-xl border-2 px-md py-lg',
                  accountType === 'tasker'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface',
                ].join(' ')}
              >
                <View className="flex-row items-center gap-md">
                  <View
                    className={[
                      'h-6 w-6 items-center justify-center rounded-full border-2',
                      accountType === 'tasker'
                        ? 'border-primary bg-primary'
                        : 'border-border',
                    ].join(' ')}
                  >
                    {accountType === 'tasker' && (
                      <Typography variant="caption" weight="bold" className="text-background">
                        ✓
                      </Typography>
                    )}
                  </View>
                  <View className="flex-1">
                    <Typography variant="body" weight="semibold" className="text-text-primary">
                      Tasker
                    </Typography>
                    <Typography variant="caption" color="secondary" className="mt-xs">
                      Complete tasks and earn money
                    </Typography>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {nameTouched && !accountType && (
              <View className="mt-sm px-xs">
                <Typography variant="caption" className="text-error">
                  Please select an account type.
                </Typography>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="gap-md px-screen-padding pb-xl">
        <Button
          label={saving ? 'Saving...' : 'Continue'}
          radius="lg"
          shadow={isValid ? 'lg' : 'none'}
          disabled={!isValid || saving}
          loading={saving}
          onPress={handleContinue}
          testID="profile-continue"
        />

        <Button
          label="Back"
          variant="outline"
          radius="lg"
          onPress={() => router.back()}
          testID="profile-back-bottom"
        />
      </View>
    </View>
  );
}
