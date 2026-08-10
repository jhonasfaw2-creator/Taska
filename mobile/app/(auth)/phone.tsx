import { useCallback, useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { sendOTP, ApiError } from '@/services';

const ETHIOPIA_COUNTRY_CODE = '+251';
const MIN_PHONE_DIGITS = 9;

function isValidPhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= MIN_PHONE_DIGITS;
}

function formatPhoneNumber(text: string): string {
  return text.replace(/\D/g, '');
}

export default function PhoneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState(ETHIOPIA_COUNTRY_CODE);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValid = isValidPhoneNumber(phoneNumber);

  const handlePhoneChange = useCallback((text: string) => {
    setPhoneNumber(formatPhoneNumber(text));
    setErrorMessage(null);
  }, []);

  const handleContinue = useCallback(async () => {
    console.log('[PhoneScreen] handleContinue called, isValid:', isValid, 'isLoading:', isLoading);
    if (!isValid || isLoading) return;

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    console.log('[PhoneScreen] Full phone number:', fullPhoneNumber);
    console.log('[PhoneScreen] Setting isLoading to true');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log('[PhoneScreen] Calling sendOTP...');
      const result = await sendOTP(fullPhoneNumber);
      console.log('[PhoneScreen] sendOTP succeeded:', JSON.stringify(result));
      console.log('[PhoneScreen] Navigating to /otp with phone:', fullPhoneNumber);
      router.push(`/otp?phone=${encodeURIComponent(fullPhoneNumber)}`);
    } catch (error) {
      console.log('[PhoneScreen] sendOTP failed:', error);
      if (error instanceof ApiError) {
        console.log('[PhoneScreen] ApiError caught - message:', error.message, 'statusCode:', error.statusCode);
        setErrorMessage(error.message);
      } else {
        console.log('[PhoneScreen] Unknown error type:', error);
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      console.log('[PhoneScreen] Setting isLoading to false');
      setIsLoading(false);
    }
  }, [isValid, isLoading, countryCode, phoneNumber, router]);

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
      <View className="px-screen-padding pt-md">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          testID="phone-back-button"
          className="mb-xl h-xl w-xl items-center justify-center rounded-full active:opacity-60"
          hitSlop={8}
        >
          <ArrowLeft size={24} className="text-text-primary" />
        </TouchableOpacity>

        <Typography variant="h2" weight="bold" className="text-text-primary">
          Enter your phone number
        </Typography>

        <View className="mt-sm">
          <Typography variant="body" color="secondary" className="leading-relaxed">
            We&apos;ll send you a verification code.
          </Typography>
        </View>
      </View>

      <View className="flex-1 px-screen-padding pt-xl">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Selected country: Ethiopia, code +251"
          testID="country-selector"
          className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-md py-md active:opacity-70"
          disabled
        >
          <View className="flex-row items-center gap-sm">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Icon name="globe" size={18} color="#2563EB" accessibilityLabel="Country" />
            </View>
            <View>
              <Typography variant="body" weight="semibold" className="text-text-primary">
                Ethiopia
              </Typography>
              <Typography variant="caption" color="secondary">
                +251
              </Typography>
            </View>
          </View>
          <Icon name="chevronDown" size={18} color="#6B7280" accessibilityLabel="Select country" />
        </TouchableOpacity>

        <View className="mt-md flex-row items-center rounded-xl border border-border bg-surface px-md">
          <View className="pr-sm border-r border-border">
            <Typography
              variant="body"
              weight="semibold"
              className="mr-sm px-xs text-text-primary"
            >
              {countryCode}
            </Typography>
          </View>

          <TextInput
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder="91 234 5678"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            autoFocus
            maxLength={15}
            editable={!isLoading}
            testID="phone-input"
            className="flex-1 px-md py-md text-body text-text-primary"
            accessibilityLabel="Phone number"
          />
        </View>

        {phoneNumber.length > 0 && !isValid && (
          <View className="mt-sm">
            <Typography variant="caption" className="text-text-secondary">
              Enter a valid Ethiopian phone number ({MIN_PHONE_DIGITS} digits)
            </Typography>
          </View>
        )}

        {errorMessage && (
          <View className="mt-md rounded-xl border border-error/30 bg-error-light px-md py-sm">
            <Typography variant="caption" className="text-error">
              {errorMessage}
            </Typography>
          </View>
        )}
      </View>

      <View className="gap-md px-screen-padding pb-xl">
        <Button
          label={isLoading ? 'Sending code...' : 'Continue'}
          radius="lg"
          shadow={isValid && !isLoading ? 'lg' : 'none'}
          disabled={!isValid || isLoading}
          loading={isLoading}
          onPress={handleContinue}
          testID="phone-continue"
        />

        <Button
          label="Back"
          variant="outline"
          radius="lg"
          disabled={isLoading}
          onPress={() => router.back()}
          testID="phone-back-bottom"
        />
      </View>
    </ScrollView>
  );
}
