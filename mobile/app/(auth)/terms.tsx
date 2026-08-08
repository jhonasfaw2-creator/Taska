import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';

export default function TermsScreen() {
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
          <ArrowLeft size={20} color="#0F172A" className="text-text-primary" />
        </TouchableOpacity>

        <Typography variant="h1" weight="bold" className="mb-md text-text-primary">
          Terms of Service
        </Typography>

        <Typography variant="caption" color="secondary" className="mb-lg leading-relaxed">
          Last updated: July 2026
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          By accessing or using Taska, you agree to be bound by these Terms of Service. If you do
          not agree, please do not use the platform.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          2. Description of Service
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          Taska connects users who need tasks completed (&ldquo;Customers&rdquo;) with verified individuals who
          can perform those tasks (&ldquo;Taskers&rdquo;). Taska is a marketplace platform and is not a party to
          any agreement between Customers and Taskers.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          3. User Responsibilities
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          Users must provide accurate information, comply with all applicable laws, and not misuse
          the platform. Taskers must complete tasks with reasonable care and skill.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          4. Payments
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          Payments are processed through the platform. Taska charges a service fee on each
          transaction. Taskers are paid after successful completion of tasks.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          5. Limitation of Liability
        </Typography>
        <Typography variant="body" color="secondary" className="mb-md leading-relaxed">
          Taska is not liable for any damages arising from the use of the platform or from
          interactions between users. Use the platform at your own risk.
        </Typography>

        <Typography variant="body" className="mb-xs text-text-primary" weight="semibold">
          6. Changes to Terms
        </Typography>
        <Typography variant="body" color="secondary" className="leading-relaxed">
          We reserve the right to modify these terms at any time. Users will be notified of
          material changes.
        </Typography>
      </ScrollView>
    </View>
  );
}
