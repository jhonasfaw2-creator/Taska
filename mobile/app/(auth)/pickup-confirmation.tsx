import { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CUSTOMER = {
  name: 'Sarah Mekonnen',
  rating: 4.9,
};

const MOCK_TASK = {
  title: 'Grocery Delivery - Fresh Produce',
  pickupAddress: 'Addis Grocery Mart, Bole Road, Addis Ababa',
  dropoffAddress: 'Kebena Street, House No. 123, Addis Ababa',
};

// ── Screen Component ─────────────────────────────────────────────────────────

export default function PickupConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'arrived' | 'picked_up'>('arrived');
  const [notes, setNotes] = useState('');

  const handleArrived = useCallback(() => {
    setStep('picked_up');
  }, []);

  const handleConfirmPickup = useCallback(() => {
    // In production, send confirmation to customer + update task status
    // Then navigate to the in-progress / navigation to dropoff screen
    Alert.alert(
      'Item Picked Up',
      'The customer has been notified. You can now proceed to the drop-off location.',
      [
        {
          text: 'Navigate to Drop-off',
          onPress: () => router.push('/live-tracking'),
        },
      ],
    );
  }, [router, notes]);

  const handleCallCustomer = useCallback(() => {
    // In production, initiate phone call
    Alert.alert('Call', 'Calling customer...');
  }, []);

  const handleChat = useCallback(() => {
    Alert.alert('Chat', 'Chat feature coming soon.');
  }, []);

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
        {/* ── Header ──────────────────────────────────────────────── */}
        <View className="px-screen-padding pt-md">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="pickup-confirm-back"
            className="mb-xl h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
            hitSlop={8}
          >
            <Typography variant="body" weight="medium" className="text-text-primary">
              ←
            </Typography>
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            {step === 'arrived' ? 'Arrived at Pickup' : 'Confirm Pickup'}
          </Typography>

          <View className="mt-sm">
            <Typography variant="body" color="secondary" className="leading-relaxed">
              {step === 'arrived'
                ? 'Let the customer know you have arrived at the pickup location.'
                : 'Confirm that you have picked up the item and are ready to proceed.'}
            </Typography>
          </View>
        </View>

        {/* ── Customer Info Card ──────────────────────────────────── */}
        <View className="mx-screen-padding mt-lg">
          <View className="overflow-hidden rounded-2xl border border-border bg-surface">
            {/* Card header */}
            <View className="border-b border-border bg-primary/[0.03] px-lg py-md">
              <Typography variant="caption" weight="semibold" className="uppercase tracking-wider text-text-secondary">
                Customer
              </Typography>
            </View>

            <View className="flex-row items-center gap-md px-lg py-lg">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Typography variant="h1">👤</Typography>
              </View>
              <View className="flex-1">
                <Typography variant="body" weight="semibold" className="text-text-primary">
                  {MOCK_CUSTOMER.name}
                </Typography>
                <View className="mt-1 flex-row items-center gap-1">
                  <Typography variant="caption" className="text-amber-500">★</Typography>
                  <Typography variant="caption" weight="semibold" className="text-text-primary">
                    {MOCK_CUSTOMER.rating.toFixed(1)}
                  </Typography>
                </View>
              </View>

              {/* Contact buttons */}
              <View className="flex-row gap-sm">
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={handleCallCustomer}
                  testID="pickup-confirm-call"
                  className="h-11 w-11 items-center justify-center rounded-full bg-green-100 active:opacity-70"
                >
                  <Typography variant="body" className="text-green-700">📞</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={handleChat}
                  testID="pickup-confirm-chat"
                  className="h-11 w-11 items-center justify-center rounded-full bg-primary/10 active:opacity-70"
                >
                  <Typography variant="body" className="text-primary">💬</Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ── Location Details ────────────────────────────────────── */}
        <View className="mx-screen-padding mt-md">
          <View className="overflow-hidden rounded-2xl border border-border bg-surface px-lg py-lg">
            <View className="flex-row gap-md">
              <View className="items-center">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <Typography variant="caption" weight="bold" className="text-green-700" style={{ fontSize: 10 }}>
                    A
                  </Typography>
                </View>
                <View className="my-1 h-10 w-0.5 bg-green-200" />
                <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Typography variant="caption" weight="bold" className="text-primary" style={{ fontSize: 10 }}>
                    B
                  </Typography>
                </View>
              </View>
              <View className="flex-1">
                <Typography variant="caption" weight="semibold" className="mb-1 text-green-700">
                  Pickup Location
                </Typography>
                <Typography variant="caption" color="secondary" className="mb-3 leading-relaxed">
                  {MOCK_TASK.pickupAddress}
                </Typography>
                <View className="border-b border-border" />
                <Typography variant="caption" weight="semibold" className="mb-1 mt-3 text-primary">
                  Drop-off Location
                </Typography>
                <Typography variant="caption" color="secondary" className="leading-relaxed">
                  {MOCK_TASK.dropoffAddress}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* ── Task Item Card ──────────────────────────────────────── */}
        <View className="mx-screen-padding mt-md">
          <View className="overflow-hidden rounded-2xl border border-border bg-surface px-lg py-lg">
            <Typography variant="caption" weight="semibold" className="mb-md uppercase tracking-wider text-text-secondary">
              Task Item
            </Typography>
            <Typography variant="body" weight="semibold" className="text-text-primary">
              {MOCK_TASK.title}
            </Typography>
            <View className="mt-md rounded-xl bg-primary/5 px-md py-md">
              <Typography variant="caption" className="leading-relaxed text-text-primary">
                Please verify all items are present and in good condition before confirming pickup.
              </Typography>
            </View>
          </View>
        </View>

        {/* ── Step 2: Pickup Notes ────────────────────────────────── */}
        {step === 'picked_up' && (
          <View className="mx-screen-padding mt-md">
            <View className="overflow-hidden rounded-2xl border border-border bg-surface px-lg py-lg">
              <Typography variant="caption" weight="semibold" className="mb-md uppercase tracking-wider text-text-secondary">
                Pickup Notes (Optional)
              </Typography>
              <View className="rounded-xl border border-border bg-surface px-md">
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about the pickup..."
                  placeholderTextColor="rgba(107, 114, 128, 0.5)"
                  autoComplete="off"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="done"
                  testID="pickup-confirm-notes"
                  className="py-md text-body text-text-primary min-h-[80px]"
                  maxLength={300}
                />
              </View>
              <View className="mt-xs flex-row justify-end px-xs">
                <Typography variant="caption" color="secondary">{notes.length}/300</Typography>
              </View>
            </View>
          </View>
        )}

        {/* Bottom spacer */}
        <View className="h-lg" />
      </ScrollView>

      {/* ── Action Buttons ────────────────────────────────────────── */}
      <View
        className="gap-md border-t border-border bg-background px-screen-padding pb-xl pt-lg"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {step === 'arrived' ? (
          <>
            <Button
              label="I've Arrived at Location"
              radius="lg"
              shadow="lg"
              leftIcon={<Typography variant="body" className="text-background">📍</Typography>}
              onPress={handleArrived}
              testID="pickup-confirm-arrived"
            />
            <Button
              label="Having trouble finding it?"
              variant="outline"
              radius="lg"
              onPress={handleCallCustomer}
              testID="pickup-confirm-help"
            />
          </>
        ) : (
          <>
            <Button
              label="Confirm Item Picked Up"
              radius="lg"
              shadow="lg"
              leftIcon={<Typography variant="body" className="text-background">✅</Typography>}
              onPress={handleConfirmPickup}
              testID="pickup-confirm-picked-up"
            />
            <Button
              label="Back"
              variant="outline"
              radius="lg"
              onPress={() => router.back()}
              testID="pickup-confirm-back-bottom"
            />
          </>
        )}
      </View>
    </View>
  );
}
