import { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { Icon, type MobileIconName } from '@/components/Icon';

interface PaymentOption {
  id: string;
  label: string;
  description: string;
  icon: MobileIconName;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'STRIPE', label: 'Card Payment', description: 'Pay with credit or debit card', icon: 'card' },
  { id: 'CASH', label: 'Cash', description: 'Pay in cash at pickup or drop-off', icon: 'banknote' },
  { id: 'MOBILE_MONEY', label: 'Mobile Money', description: 'Pay with mobile money transfer', icon: 'phone' },
];

export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { amount, currency } = useLocalSearchParams<{
    amount: string;
    currency: string;
  }>();
  const [selected, setSelected] = useState<string>('STRIPE');

  const handleConfirm = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-screen-padding pt-lg">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="mb-xl h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
            hitSlop={8}
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            Payment Method
          </Typography>
          <Typography variant="body" color="secondary" className="mt-sm">
            {currency || 'ETB'} {amount ? parseFloat(amount).toFixed(2) : '0.00'}
          </Typography>
        </View>

        <View className="gap-md px-screen-padding pt-xl">
          {PAYMENT_OPTIONS.map((option) => {
            const isSelected = selected === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(option.id)}
                activeOpacity={0.7}
                className={[
                  'flex-row items-center gap-md rounded-2xl border bg-surface p-lg',
                  isSelected ? 'border-primary bg-primary/5' : 'border-border',
                ].join(' ')}
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon name={option.icon} size={24} color="#2563EB" accessibilityLabel={option.label} />
                </View>
                <View className="flex-1">
                  <Typography variant="body" weight="semibold" className="text-text-primary">
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="secondary" className="mt-xs">
                    {option.description}
                  </Typography>
                </View>
                <View
                  className={[
                    'h-6 w-6 items-center justify-center rounded-full border-2',
                    isSelected ? 'border-primary bg-primary' : 'border-border',
                  ].join(' ')}
                >
                  {isSelected && (
                    <View className="h-2 w-2 rounded-full bg-background" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-screen-padding pb-lg pt-md"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Confirm payment method"
          onPress={handleConfirm}
          activeOpacity={0.85}
          className="w-full flex-row items-center justify-center rounded-full bg-primary px-lg py-md"
          style={{
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Typography variant="body" weight="semibold" className="text-background">
            Confirm
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}
