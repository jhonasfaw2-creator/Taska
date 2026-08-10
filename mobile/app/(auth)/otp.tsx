import { useCallback, useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';
import { sendOTP, verifyOTP, getUserProfile, isProfileComplete, ApiError } from '@/services';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

function formatOtpDigits(text: string): string {
  return text.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValid = otp.length === OTP_LENGTH;
  const digits = otp.split('');
  const canResend = resendCooldown <= 0;

  const handleOtpChange = useCallback((text: string) => {
    setOtp(formatOtpDigits(text));
    setErrorMessage(null);
  }, []);

  const handleVerify = useCallback(async () => {
    console.log('[OTPScreen] handleVerify called, isValid:', isValid, 'isVerifying:', isVerifying, 'phone:', phone);
    if (!isValid || isVerifying || !phone) return;

    console.log('[OTPScreen] Setting isVerifying to true');
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      console.log('[OTPScreen] Calling verifyOTP with phone:', phone, 'otp:', otp);
      await verifyOTP(phone, otp);
      console.log('[OTPScreen] verifyOTP succeeded, checking profile completeness');

      // Check if the user needs to complete their profile
      try {
        const profile = await getUserProfile();
        if (isProfileComplete(profile)) {
          console.log('[OTPScreen] Profile is complete, navigating to /customer-home');
          router.replace('/customer-home');
        } else {
          console.log('[OTPScreen] Profile is incomplete, navigating to /create-profile');
          router.replace({ pathname: '/create-profile', params: { phone } });
        }
      } catch (profileError) {
        // If profile fetch fails, navigate to create-profile as a safe fallback
        console.log('[OTPScreen] Profile fetch failed, navigating to /create-profile:', profileError);
        router.replace({ pathname: '/create-profile', params: { phone } });
      }
    } catch (error) {
      console.log('[OTPScreen] verifyOTP failed:', error);
      if (error instanceof ApiError) {
        console.log('[OTPScreen] ApiError - message:', error.message, 'statusCode:', error.statusCode);
        setErrorMessage(error.message);
      } else {
        console.log('[OTPScreen] Unknown error type:', error);
        setErrorMessage('Verification failed. Please try again.');
      }
      // Clear the OTP input on error so user can re-enter
      setOtp('');
    } finally {
      console.log('[OTPScreen] Setting isVerifying to false');
      setIsVerifying(false);
    }
  }, [isValid, isVerifying, phone, otp, router]);

  const handleResend = useCallback(async () => {
    console.log('[OTPScreen] handleResend called, canResend:', canResend, 'isVerifying:', isVerifying, 'phone:', phone);
    if (!canResend || isVerifying || !phone) return;

    console.log('[OTPScreen] Resending OTP to:', phone);
    setOtp('');
    setErrorMessage(null);

    try {
      await sendOTP(phone);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      console.log('[OTPScreen] Resend successful');
    } catch (error) {
      console.log('[OTPScreen] Resend failed:', error);
      if (error instanceof ApiError) {
        console.log('[OTPScreen] ApiError - message:', error.message, 'statusCode:', error.statusCode);
        setErrorMessage(error.message);
      } else {
        console.log('[OTPScreen] Unknown error type:', error);
        setErrorMessage('Failed to resend code. Please try again.');
      }
    }
  }, [canResend, isVerifying, phone]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Redirect back if no phone parameter is present
  useEffect(() => {
    if (!phone) {
      router.replace('/phone');
    }
  }, [phone, router]);

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
      {/* Top section with back button, title, and subtitle */}
      <View className="px-screen-padding pt-md">
        {/* Back button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          testID="otp-back-button"
          className="mb-xl h-xl w-xl items-center justify-center rounded-full active:opacity-60"
          hitSlop={8}
        >
          <ArrowLeft size={24} className="text-text-primary" />
        </TouchableOpacity>

        {/* Title */}
        <Typography variant="h2" weight="bold" className="text-text-primary">
          Verify your phone number
        </Typography>

        {/* Subtitle */}
        <View className="mt-sm">
          <Typography variant="body" color="secondary" className="leading-relaxed">
            Enter the 6-digit code sent to{' '}
            <Typography variant="body" weight="semibold" className="text-text-primary">
              {phone ?? ''}
            </Typography>
          </Typography>
        </View>
      </View>

      {/* OTP input area */}
      <View className="flex-1 items-center justify-center px-screen-padding">
        {/* Hidden TextInput that captures the OTP */}
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          autoFocus
          editable={!isVerifying}
          className="absolute h-0 w-0 opacity-0"
          testID="otp-hidden-input"
          accessibilityLabel="Verification code, 6 digits"
        />

        {/* Digit boxes */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          disabled={isVerifying}
          className="w-full flex-row items-center justify-center gap-sm"
        >
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const isFilled = !!digits[index];
            const isFocused = otp.length === index && otp.length < OTP_LENGTH;

            return (
              <View
                key={`otp-digit-${index}`}
                className={[
                  'h-14 w-12 items-center justify-center rounded-xl border-2',
                  isFocused ? 'border-primary' : isFilled ? 'border-primary' : 'border-border',
                  isFilled ? 'bg-surface' : 'bg-surface',
                ].join(' ')}
              >
                <Typography
                  variant="h2"
                  weight="bold"
                  className="text-text-primary"
                >
                  {digits[index] ?? ''}
                </Typography>
              </View>
            );
          })}
        </TouchableOpacity>

        {/* Paste hint */}
        {otp.length === 0 && !isVerifying && !errorMessage && (
          <View className="mt-md">
            <Typography variant="caption" color="secondary" className="text-center">
              The code will auto-fill from your SMS messages
            </Typography>
          </View>
        )}

        {/* Error message */}
        {errorMessage && (
          <View className="mt-md w-full rounded-xl border border-error/30 bg-error-light px-md py-sm">
            <Typography variant="caption" className="text-center text-error">
              {errorMessage}
            </Typography>
          </View>
        )}
      </View>

      {/* Bottom section with Verify and Resend */}
      <View className="gap-md px-screen-padding pb-xl">
        <Button
          label={isVerifying ? 'Verifying...' : 'Verify'}
          radius="lg"
          shadow={isValid && !isVerifying ? 'lg' : 'none'}
          disabled={!isValid || isVerifying}
          loading={isVerifying}
          onPress={handleVerify}
          testID="otp-verify"
        />

        {/* Resend code */}
        <View className="flex-row items-center justify-center">
          <Typography variant="body" color="secondary" className="text-center">
            {canResend ? "Didn't receive the code? " : 'Resend code in '}
          </Typography>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              canResend
                ? 'Resend verification code'
                : `Resend code in ${resendCooldown} seconds`
            }
            onPress={handleResend}
            disabled={!canResend || isVerifying}
            testID="otp-resend"
            className="active:opacity-60"
          >
            {canResend ? (
              <Typography
                variant="body"
                weight="semibold"
                className="text-primary"
              >
                Resend code
              </Typography>
            ) : (
              <Typography
                variant="body"
                weight="semibold"
                className="text-text-secondary"
              >
                {resendCooldown}s
              </Typography>
            )}
          </TouchableOpacity>
        </View>

        <Button
          label="Back"
          variant="outline"
          radius="lg"
          disabled={isVerifying}
          onPress={() => router.back()}
          testID="otp-back-bottom"
        />
      </View>
    </ScrollView>
  );
}
