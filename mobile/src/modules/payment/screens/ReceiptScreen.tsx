import { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { getPayment } from '@/services/payment.service';
import type { Payment } from '@/types/payment';

function ReceiptRow({
  label,
  value,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-sm">
      <Typography variant="body" color="secondary">
        {label}
      </Typography>
      <Typography
        variant="body"
        weight={bold ? 'bold' : 'medium'}
        className={highlight ? 'text-success' : 'text-text-primary'}
      >
        {value}
      </Typography>
    </View>
  );
}

export default function ReceiptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) return;
    getPayment(paymentId)
      .then(setPayment)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [paymentId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Typography variant="body" color="secondary">Loading receipt...</Typography>
      </View>
    );
  }

  if (!payment) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-screen-padding">
        <Typography variant="h1" className="mb-md">🔍</Typography>
        <Typography variant="body" weight="semibold" className="text-text-primary">
          Receipt not found
        </Typography>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-lg rounded-full bg-primary px-xl py-md"
          activeOpacity={0.8}
        >
          <Typography variant="body" weight="semibold" className="text-background">
            Go Back
          </Typography>
        </TouchableOpacity>
      </View>
    );
  }

  const platformFee = payment.platformFee ?? Math.round(payment.amount * 0.1 * 100) / 100;
  const taskerAmount = payment.taskerAmount ?? payment.amount - platformFee;

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
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <View className="mx-screen-padding rounded-2xl border-2 border-primary/20 bg-surface p-lg">
          <View className="items-center pb-lg">
            <View className="mb-md h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Typography variant="h1">✅</Typography>
            </View>
            <Typography variant="h2" weight="bold" className="text-success">
              Payment Successful
            </Typography>
            <Typography variant="caption" color="secondary" className="mt-xs">
              {new Date(payment.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
          </View>

          <View className="h-px bg-border" />

          <View className="pt-lg">
            <ReceiptRow
              label="Transaction ID"
              value={payment.transactionReference ?? payment.id.slice(0, 12)}
            />
            <ReceiptRow
              label="Payment Method"
              value={payment.paymentMethod}
            />
            <ReceiptRow
              label="Amount"
              value={`ETB ${payment.amount.toFixed(2)}`}
              bold
            />
            <ReceiptRow
              label="Platform Fee"
              value={`-ETB ${platformFee.toFixed(2)}`}
            />
            <ReceiptRow
              label="Tasker Payout"
              value={`ETB ${taskerAmount.toFixed(2)}`}
              highlight
            />
            <ReceiptRow
              label="Status"
              value={payment.paymentStatus}
            />
          </View>

          <View className="mt-lg border-t border-border pt-md">
            <Typography variant="caption" color="secondary" className="text-center">
              Taska Payment Receipt
            </Typography>
          </View>
        </View>

        <View className="px-screen-padding pt-xl">
          <View className="rounded-2xl border border-border bg-surface p-lg">
            <Typography variant="body" weight="semibold" className="mb-sm text-text-primary">
              Payment Timeline
            </Typography>
            <View className="gap-md">
              <View className="flex-row items-center gap-md">
                <View className="h-2 w-2 rounded-full bg-success" />
                <Typography variant="caption" color="secondary">
                  Created — {new Date(payment.createdAt).toLocaleString()}
                </Typography>
              </View>
              {payment.paidAt && (
                <View className="flex-row items-center gap-md">
                  <View className="h-2 w-2 rounded-full bg-success" />
                  <Typography variant="caption" color="secondary">
                    Paid — {new Date(payment.paidAt).toLocaleString()}
                  </Typography>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-screen-padding pb-lg pt-md"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Return home"
          onPress={() => router.replace('/customer-home')}
          activeOpacity={0.85}
          className="w-full rounded-full bg-primary px-lg py-md"
          style={{
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Typography variant="body" weight="semibold" className="text-center text-background">
            Return Home
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}
