import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Logo, Button, Typography, Link } from '@/components/ui';

const APP_VERSION = (Constants.expoConfig?.version as string) ?? '1.0.0';

export default function AuthEntryScreen() {
  const router = useRouter();

  const handleContinueWithPhone = () => {
    router.push('/phone');
  };

  const handleOpenTerms = () => {
    router.push('/terms');
  };

  const handleOpenPrivacy = () => {
    router.push('/privacy');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-screen-padding">
        <View className="items-center">
          <View className="items-center justify-center rounded-2xl bg-surface p-xl shadow-lg">
            <Logo size={104} />
          </View>

          <View className="h-xl" />

          <Typography variant="h1" weight="bold" className="text-center text-text-primary">
            Welcome to Taska
          </Typography>

          <View className="h-sm" />

          <Typography
            variant="body"
            weight="regular"
            color="secondary"
            className="max-w-[320px] text-center"
          >
            Get things done across Addis Ababa with trusted taskers.
          </Typography>
        </View>
      </View>

      <View className="px-screen-padding pb-xl">
        <Button
          label="Continue with Phone"
          radius="lg"
          shadow="lg"
          onPress={handleContinueWithPhone}
          testID="continue-with-phone"
        />

        <View className="h-lg" />

        <View className="flex-row items-center justify-center">
          <Link label="Terms of Service" onPress={handleOpenTerms} testID="terms-link" />
          <Typography variant="caption" color="secondary" className="px-xs">
            {'·'}
          </Typography>
          <Link label="Privacy Policy" onPress={handleOpenPrivacy} testID="privacy-link" />
        </View>

        <View className="h-md" />

        <Typography variant="caption" color="secondary" className="text-center">
          {`Taska v${APP_VERSION}`}
        </Typography>
      </View>
    </SafeAreaView>
  );
}
