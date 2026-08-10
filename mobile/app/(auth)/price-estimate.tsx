import { useCallback, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';
import { useTaskContext } from '@/store/TaskContext';
import { VEHICLES } from '@/data/vehicles';
import { Icon } from '@/components/Icon';

const PRICING = {
  baseFare: 5.00,
  ratePerKm: 2.50,
  ratePerMinute: 0.50,
  serviceFee: 1.50,
  currency: 'ETB' as const,
  estimatedMinutes: 18,
};

export default function PriceEstimateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useTaskContext();

  const vehicle = state.vehicleType
    ? VEHICLES.find((v) => v.id === state.vehicleType) ?? null
    : null;

  const estimatedDistance = useMemo(() => {
    if (state.pickup && state.dropoff) {
      const R = 6371;
      const dLat = ((state.dropoff.latitude - state.pickup.latitude) * Math.PI) / 180;
      const dLon = ((state.dropoff.longitude - state.pickup.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((state.pickup.latitude * Math.PI) / 180) *
          Math.cos((state.dropoff.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;
      return dist > 0.1 ? dist : 4.2;
    }
    return 4.2;
  }, [state.pickup, state.dropoff]);

  const breakdown = useMemo(() => {
    const distanceKm = Math.round(estimatedDistance * 10) / 10;
    const distanceCharge = distanceKm * PRICING.ratePerKm;
    const timeCharge = PRICING.estimatedMinutes * PRICING.ratePerMinute;
    const subtotal = PRICING.baseFare + distanceCharge + timeCharge;
    const total = subtotal + PRICING.serviceFee;

    return {
      distanceKm,
      distanceCharge,
      timeCharge,
      subtotal,
      total,
      items: [
        { label: 'Base fare', amount: PRICING.baseFare },
        { label: `Distance (${distanceKm.toFixed(1)} km × ${PRICING.ratePerKm.toFixed(2)})`, amount: distanceCharge },
        { label: `Time (${PRICING.estimatedMinutes} min × ${PRICING.ratePerMinute.toFixed(2)})`, amount: timeCharge },
      ] as const,
    };
  }, [estimatedDistance]);

  const handlePlaceOrder = useCallback(() => {
    router.push('/confirm-task');
  }, [router]);

  const formatCurrency = (value: number) =>
    `${PRICING.currency} ${value.toFixed(2)}`;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-screen-padding pt-md">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="price-estimate-back-button"
            className="mb-xl h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
            hitSlop={8}
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            Price estimate
          </Typography>

          <View className="mt-sm">
            <Typography variant="body" color="secondary" className="leading-relaxed">
              Review the pricing breakdown for your task. Prices are estimates and may vary.
            </Typography>
          </View>
        </View>

        <View className="flex-1 px-screen-padding pt-xl">
          <View className="mb-lg rounded-2xl border border-border bg-surface p-lg">
            <Typography
              variant="caption"
              weight="medium"
              className="mb-xs uppercase tracking-wide text-text-secondary"
            >
              Selected vehicle
            </Typography>
            <View className="flex-row items-center gap-md">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Typography variant="h1" className="text-primary">
                  <Icon name={vehicle?.icon ?? 'car'} size={24} color="#2563EB" accessibilityLabel="Vehicle" />
                </Typography>
              </View>
              <View className="flex-1">
                <Typography variant="body" weight="semibold" className="text-text-primary">
                  {vehicle?.name ?? 'Not specified'}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {vehicle?.description ?? ''}
                </Typography>
              </View>
              <View className="rounded-full bg-primary/10 px-sm py-px">
                <Typography variant="caption" weight="semibold" className="text-primary">
                  {breakdown.distanceKm.toFixed(1)} km
                </Typography>
              </View>
            </View>
          </View>

          <View className="overflow-hidden rounded-2xl border border-border bg-surface">
            <View className="border-b border-border px-lg py-md">
              <Typography
                variant="caption"
                weight="medium"
                className="uppercase tracking-wide text-text-secondary"
              >
                Price breakdown
              </Typography>
            </View>

            <View className="px-lg py-md">
              {breakdown.items.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-sm"
                >
                  <Typography variant="body" color="secondary" className="flex-1">
                    {item.label}
                  </Typography>
                  <Typography variant="body" weight="medium" className="ml-md text-text-primary">
                    {formatCurrency(item.amount)}
                  </Typography>
                </View>
              ))}

              <View className="my-sm border-b border-border" />

              <View className="flex-row items-center justify-between py-sm">
                <Typography variant="body" color="secondary" className="flex-1">
                  Service fee
                </Typography>
                <Typography variant="body" weight="medium" className="ml-md text-text-primary">
                  {formatCurrency(PRICING.serviceFee)}
                </Typography>
              </View>

              <View className="my-sm border-b border-border" />

              <View className="flex-row items-center justify-between py-sm">
                <Typography variant="body" weight="semibold" className="text-text-primary">
                  Total
                </Typography>
                <View className="items-end">
                  <Typography variant="body" weight="semibold" className="text-text-primary">
                    {formatCurrency(breakdown.total)}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {breakdown.subtotal.toFixed(2)} + {PRICING.serviceFee.toFixed(2)} fee
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-lg flex-row items-start gap-sm rounded-xl border border-border bg-surface px-md py-md">
            <Typography variant="body" className="mt-px text-primary">
              ℹ️
            </Typography>
            <Typography variant="caption" color="secondary" className="flex-1 leading-relaxed">
              The final price may vary based on actual distance, time, and any additional services requested by the tasker.
            </Typography>
          </View>

          <View className="mt-lg items-center">
            <View className="flex-row items-center gap-xs rounded-full bg-primary/10 px-lg py-sm">
              <Typography variant="body" className="text-primary">
                ⏱️
              </Typography>
              <Typography variant="caption" weight="semibold" className="text-primary">
                Estimated {PRICING.estimatedMinutes} min delivery
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="gap-md border-t border-border bg-background px-screen-padding pb-xl pt-lg"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          label={`Place Order — ${formatCurrency(breakdown.total)}`}
          radius="lg"
          shadow="lg"
          onPress={handlePlaceOrder}
          testID="price-estimate-place-order"
        />
        <Button
          label="Back"
          variant="outline"
          radius="lg"
          onPress={() => router.back()}
          testID="price-estimate-back-bottom"
        />
      </View>
    </View>
  );
}
