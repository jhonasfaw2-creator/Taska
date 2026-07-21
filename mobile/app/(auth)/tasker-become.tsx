import { useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';

const BENEFITS = [
  { icon: '⏰', title: 'Flexible Schedule', desc: 'Work whenever you want — set your own hours and be your own boss.' },
  { icon: '💰', title: 'Competitive Earnings', desc: 'Keep a large share of each task. Earn more as you complete more.' },
  { icon: '📍', title: 'Local Tasks', desc: 'Get task requests near your current location. Minimize travel time.' },
  { icon: '📈', title: 'Growth & Rewards', desc: 'Top-rated taskers unlock higher-paying tasks and exclusive benefits.' },
];

const REQUIREMENTS = [
  'Be at least 18 years old',
  'Own a smartphone with internet access',
  'Valid ID for verification',
  'Reliable mode of transport',
];

export default function BecomeTaskerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleApply = useCallback(() => {
    router.push('/tasker-apply');
  }, [router]);

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
        {/* Hero */}
        <View className="items-center bg-primary px-screen-padding pb-xl pt-lg">
          <View className="mb-md h-20 w-20 items-center justify-center rounded-full border-2 border-background/30 bg-background/20">
            <Typography variant="display" className="text-background" style={{ fontSize: 40 }}>🛵</Typography>
          </View>
          <Typography variant="h2" weight="bold" className="text-center text-background">
            Become a Tasker
          </Typography>
          <Typography
            variant="body"
            className="mt-sm max-w-xs text-center leading-relaxed text-background/80"
          >
            Turn your free time into income. Help people in your community and earn on your own terms.
          </Typography>
        </View>

        {/* Benefits */}
        <View className="px-screen-padding pt-xl">
          <Typography variant="body" weight="semibold" className="mb-md text-text-primary">
            Why become a Tasker?
          </Typography>
          {BENEFITS.map((benefit) => (
            <View
              key={benefit.title}
              className="mb-sm flex-row items-start rounded-2xl border border-border bg-surface p-lg"
            >
              <View className="mr-md h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Typography variant="h2">{benefit.icon}</Typography>
              </View>
              <View className="flex-1">
                <Typography variant="body" weight="semibold" className="text-text-primary">
                  {benefit.title}
                </Typography>
                <Typography variant="caption" color="secondary" className="mt-1 leading-relaxed">
                  {benefit.desc}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        {/* Requirements */}
        <View className="px-screen-padding pt-xl">
          <Typography variant="body" weight="semibold" className="mb-md text-text-primary">
            Requirements
          </Typography>
          <View className="rounded-2xl border border-border bg-surface px-lg py-lg">
            {REQUIREMENTS.map((req, i) => (
              <View key={i} className="flex-row items-center py-sm">
                <View className="mr-md h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <Typography variant="caption" className="text-green-600">✓</Typography>
                </View>
                <Typography variant="body" className="flex-1 text-text-primary">
                  {req}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        {/* Earnings */}
        <View className="px-screen-padding pt-xl">
          <Typography variant="body" weight="semibold" className="mb-md text-text-primary">
            How earnings work
          </Typography>
          <View className="rounded-2xl border border-border bg-surface p-lg">
            <Typography variant="body" className="leading-relaxed text-text-primary">
              You earn a base fee per task plus a service fee. Tasks with longer distance or larger
              items pay more. Top-rated taskers qualify for priority matching and higher-paying
              opportunities.
            </Typography>
          </View>
        </View>

        <View className="h-xl" />
      </ScrollView>

      <View className="gap-md border-t border-border bg-background px-screen-padding pb-xl pt-lg">
        <Button
          label="Apply Now"
          radius="lg"
          shadow="lg"
          onPress={handleApply}
          testID="tasker-become-apply"
        />
        <Button
          label="Not Now"
          variant="outline"
          radius="lg"
          onPress={() => router.back()}
          testID="tasker-become-back"
        />
      </View>
    </View>
  );
}
