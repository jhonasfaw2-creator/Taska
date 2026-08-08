import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { getPaymentByTask, createPayment } from '@/services/payment.service';
import type { Payment } from '@/types/payment';
import { ApiError } from '@/services';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-warning',
  PROCESSING: 'text-primary',
  PAID: 'text-success',
  FAILED: 'text-error',
  CANCELLED: 'text-text-secondary',
  REFUNDED: 'text-purple-600',
};

export default function PaymentSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { taskId, amount, currency } = useLocalSearchParams<{
    taskId: string;
    amount: string;
    currency: string;
  }>();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = amount ? parseFloat(amount) : 0;
  const platformFee = Math.round(parsedAmount * 0.1 * 100) / 100;
  const taskerAmount = parsedAmount - platformFee;
  const displayCurrency = currency || 'ETB';

  const loadExistingPayment = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const existing = await getPaymentByTask(taskId);
      setPayment(existing);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        setPayment(null);
      }
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadExistingPayment();
  }, [loadExistingPayment]);

  const handlePayNow = useCallback(async () => {
    if (!taskId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createPayment({
        taskId,
        amount: parsedAmount,
        currency: displayCurrency,
      });
      if (result.paymentStatus === 'PROCESSING') {
        router.replace(
          `/payment-status?paymentId=${result.id}&taskId=${taskId}`,
        );
      } else {
        setPayment(result);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `Payment failed: ${err.message}`
          : 'An unexpected error occurred',
      );
    } finally {
      setSubmitting(false);
    }
  }, [taskId, parsedAmount, displayCurrency, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Typography variant="body" color="secondary">Loading...</Typography>
      </View>
    );
  }

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

          <Typography variant="h2" weight="bold" className="text-text-primary">
            Payment Summary
          </Typography>
        </View>

        <View className="px-screen-padding pt-xl">
          {error && (
            <View className="mb-md rounded-xl bg-error-light px-md py-sm">
              <Typography variant="caption" className="text-error">
                {error}
              </Typography>
            </View>
          )}

          {payment && payment.paymentStatus === 'PAID' ? (
            <View className="items-center rounded-2xl border border-border bg-surface px-lg py-xl">
              <Typography variant="h1" className="mb-sm">✅</Typography>
              <Typography variant="body" weight="semibold" className="text-center text-text-primary">
                Payment already completed
              </Typography>
              <TouchableOpacity
                onPress={() => router.push(`/receipt?paymentId=${payment.id}`)}
                className="mt-md"
              >
                <Typography variant="body" weight="medium" className="text-primary">
                  View Receipt
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="mb-lg rounded-2xl border border-border bg-surface p-lg">
                <View className="items-center pb-lg">
                  <Typography
                    variant="display"
                    weight="bold"
                    className="text-text-primary"
                  >
                    {displayCurrency} {parsedAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="secondary" className="mt-xs">
                    Total Amount
                  </Typography>
                </View>

                <View className="h-px bg-border" />

                <View className="gap-md pt-lg">
                  <View className="flex-row items-center justify-between">
                    <Typography variant="body" color="secondary">
                      Task Amount
                    </Typography>
                    <Typography variant="body" weight="medium" className="text-text-primary">
                      {displayCurrency} {parsedAmount.toFixed(2)}
                    </Typography>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Typography variant="body" color="secondary">
                      Platform Fee (10%)
                    </Typography>
                    <Typography variant="body" className="text-text-primary">
                      -{displayCurrency} {platformFee.toFixed(2)}
                    </Typography>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Typography variant="body" weight="semibold" className="text-text-primary">
                      Tasker Payout
                    </Typography>
                    <Typography variant="body" weight="bold" className="text-success">
                      {displayCurrency} {taskerAmount.toFixed(2)}
                    </Typography>
                  </View>
                </View>

                {payment && (
                  <View className="mt-lg border-t border-border pt-md">
                    <View className="flex-row items-center justify-between">
                      <Typography variant="caption" color="secondary">
                        Status
                      </Typography>
                      <Typography
                        variant="caption"
                        weight="semibold"
                        className={STATUS_COLORS[payment.paymentStatus] ?? 'text-text-primary'}
                      >
                        {payment.paymentStatus}
                      </Typography>
                    </View>
                  </View>
                )}
              </View>

              <View className="rounded-2xl border border-border bg-surface p-lg">
                <Typography variant="body" weight="semibold" className="mb-sm text-text-primary">
                  Payment Method
                </Typography>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => router.push(`/payment-method?taskId=${taskId}&amount=${parsedAmount}&currency=${displayCurrency}`)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between rounded-xl border border-border px-md py-lg"
                >
                  <View className="flex-row items-center gap-md">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Typography variant="body">💳</Typography>
                    </View>
                    <View>
                      <Typography variant="body" weight="medium" className="text-text-primary">
                        Stripe
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        Pay with card
                      </Typography>
                    </View>
                  </View>
                  <Typography variant="caption" className="text-primary">Change</Typography>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {(!payment || payment.paymentStatus !== 'PAID') && (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-screen-padding pb-lg pt-md"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Proceed to payment"
            onPress={handlePayNow}
            disabled={submitting}
            activeOpacity={0.85}
            className="w-full flex-row items-center justify-center rounded-full bg-primary px-lg py-md"
            style={{
              opacity: submitting ? 0.6 : 1,
              shadowColor: '#2563EB',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Typography variant="body" weight="semibold" className="text-background">
              {submitting ? 'Processing...' : `Pay ${displayCurrency} ${parsedAmount.toFixed(2)}`}
            </Typography>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
