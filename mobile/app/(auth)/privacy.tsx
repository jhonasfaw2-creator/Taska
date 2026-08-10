import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="mb-xl h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
          hitSlop={8}
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </TouchableOpacity>

        <Typography variant="h1" weight="bold" className="mb-md text-text-primary">
          Privacy Policy
        </Typography>

        <Typography variant="caption" color="secondary" className="mb-lg leading-relaxed">
          Last updated: July 2026
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          1. Information We Collect
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          We collect information you provide when creating an account, including your name, phone
          number, and profile information. We also collect usage data, device information, and
          location data when you use the platform.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          2. How We Use Your Information
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          Your information is used to provide and improve our services, process transactions,
          communicate with you, and ensure platform safety and security.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          3. Data Sharing
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          We share necessary information between Customers and Taskers to facilitate tasks. We do
          not sell your personal data to third parties.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          4. Data Security
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          We implement industry-standard security measures to protect your data, including
          encryption and secure storage practices.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          5. Your Rights
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          You can access, update, or delete your account information at any time through your
          profile settings. Contact us for data deletion requests.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          6. Contact
        </Typography>
        <Typography variant="body" color="secondary" className="leading-relaxed">
          For questions about this policy, contact us through the app or at privacy@taska.app.
        </Typography>
      </ScrollView>
    </View>
  );
}
