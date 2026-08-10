import { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';
import { Icon } from '@/components/Icon';

const MOCK_CUSTOMER = {
  name: 'Sarah Mekonnen',
  rating: 4.9,
};

const MOCK_TASK = {
  title: 'Grocery Delivery - Fresh Produce',
  pickupAddress: 'Addis Grocery Mart, Bole Road, Addis Ababa',
  dropoffAddress: 'Kebena Street, House No. 123, Addis Ababa',
};

export default function PickupConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'arrived' | 'picked_up'>('arrived');
  const [notes, setNotes] = useState('');

  const handleArrived = useCallback(() => {
    setStep('picked_up');
  }, []);

  const handleConfirmPickup = useCallback(() => {
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
  }, [router]);

  const handleCallCustomer = useCallback(() => {
    Linking.openURL('tel:+251911234567').catch(() => {
      Alert.alert('Error', 'Unable to make a phone call on this device.');
    });
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
        <View className="px-screen-padding pt-md">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="pickup-confirm-back"
            className="mb-xl h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
            hitSlop={8}
          >
            <ArrowLeft size={20} className="text-text-primary" />
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

        <View className="mx-screen-padding mt-lg">
          <View className="overflow-hidden rounded-2xl border border-border bg-surface">
            <View className="border-b border-border bg-surface-secondary/50 px-lg py-md">
              <Typography variant="caption" weight="semibold" className="uppercase tracking-wider text-text-secondary">
                Customer
              </Typography>
            </View>

            <View className="flex-row items-center gap-md px-lg py-lg">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Icon name="user" size={32} color="#2563EB" accessibilityLabel="Tasker" />
              </View>
              <View className="flex-1">
                <Typography variant="body" weight="semibold" className="text-text-primary">
                  {MOCK_CUSTOMER.name}
                </Typography>
                <View className="mt-1 flex-row items-center gap-1">
                  <Icon name="star" size={14} color="#F59E0B" fill="#F59E0B" accessibilityLabel="Rating" />
                  <Typography variant="caption" weight="semibold" className="text-text-primary">
                    {MOCK_CUSTOMER.rating.toFixed(1)}
                  </Typography>
                </View>
              </View>

              <View className="flex-row gap-sm">
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={handleCallCustomer}
                  testID="pickup-confirm-call"
                  className="h-11 w-11 items-center justify-center rounded-full bg-success/20 active:opacity-70"
                >
                  <Icon name="phone" size={20} color="#22C55E" accessibilityLabel="Call" />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={handleChat}
                  testID="pickup-confirm-chat"
                  className="h-11 w-11 items-center justify-center rounded-full bg-primary/10 active:opacity-70"
                >
                  <Icon name="message" size={20} color="#2563EB" accessibilityLabel="Message" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="mx-screen-padding mt-md">
          <View className="overflow-hidden rounded-2xl border border-border bg-surface px-lg py-lg">
            <View className="flex-row gap-md">
              <View className="items-center">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-success/20">
                  <Typography variant="caption" weight="bold" className="text-success" style={{ fontSize: 10 }}>A</Typography>
                </View>
                <View className="my-1 h-10 w-0.5 bg-success/30" />
                <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Typography variant="caption" weight="bold" className="text-primary" style={{ fontSize: 10 }}>B</Typography>
                </View>
              </View>
              <View className="flex-1">
                <Typography variant="caption" weight="semibold" className="mb-1 text-success">
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

        <View className="h-lg" />
      </ScrollView>

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
              leftIcon={<Icon name="mapPin" size={20} color="#FFFFFF" accessibilityLabel="Location" />}
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
              leftIcon={<Icon name="success" size={20} color="#FFFFFF" accessibilityLabel="Confirmed" />}
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