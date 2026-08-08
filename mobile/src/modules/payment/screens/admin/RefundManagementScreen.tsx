import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { SkeletonBlock } from '@/components/SkeletonLoader';
import { listAllPayments, refundPayment } from '@/services/payment.service';
import type { Payment, RefundReason } from '@/types/payment';
import { ApiError } from '@/services';

const REFUND_REASONS: { value: RefundReason; label: string }[] = [
  { value: 'CUSTOMER_REQUEST', label: 'Customer Request' },
  { value: 'TASK_CANCELLED', label: 'Task Cancelled' },
  { value: 'SERVICE_ISSUE', label: 'Service Issue' },
  { value: 'DUPLICATE', label: 'Duplicate Payment' },
  { value: 'FRAUD', label: 'Fraud' },
  { value: 'OTHER', label: 'Other' },
];

function PaidPaymentCard({
  payment,
  onRefund,
}: {
  payment: Payment;
  onRefund: (payment: Payment) => void;
}) {
  return (
    <View className="mb-sm rounded-2xl border border-border bg-surface p-lg">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Typography variant="body" weight="semibold" className="text-text-primary">
            {payment.transactionReference ?? payment.id.slice(0, 8)}
          </Typography>
          <Typography variant="caption" color="secondary" className="mt-xs">
            {new Date(payment.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="secondary">
            Paid: ETB {payment.amount.toFixed(2)}
          </Typography>
          {payment.refundedAmount > 0 && (
            <Typography variant="caption" className="text-purple-600">
              Refunded: ETB {payment.refundedAmount.toFixed(2)}
            </Typography>
          )}
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Refund payment ${payment.id}`}
          onPress={() => onRefund(payment)}
          className="rounded-full bg-purple-100 px-md py-sm"
          activeOpacity={0.7}
        >
          <Typography variant="caption" weight="semibold" className="text-purple-700">
            Refund
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RefundManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState<RefundReason>('CUSTOMER_REQUEST');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listAllPayments();
      setPayments(data.filter((p) => p.paymentStatus === 'PAID' || p.paymentStatus === 'PARTIALLY_REFUNDED'));
    } catch (err) {
      console.log('[RefundManagement] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefundPress = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setRefundAmount(String(payment.amount - payment.refundedAmount));
    setRefundReason('CUSTOMER_REQUEST');
    setError(null);
  }, []);

  const handleSubmitRefund = useCallback(async () => {
    if (!selectedPayment) return;
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Enter a valid refund amount');
      return;
    }
    const maxRefund = selectedPayment.amount - selectedPayment.refundedAmount;
    if (amount > maxRefund) {
      setError(`Maximum refund amount is ETB ${maxRefund.toFixed(2)}`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await refundPayment({
        paymentId: selectedPayment.id,
        amount,
        reason: refundReason,
      });
      Alert.alert('Success', 'Refund processed successfully');
      setSelectedPayment(null);
      setRefundAmount('');
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Refund failed',
      );
    } finally {
      setSubmitting(false);
    }
  }, [selectedPayment, refundAmount, refundReason, load]);

  const paidPayments = payments;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 100,
        }}
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
            Refund Management
          </Typography>
          <Typography variant="caption" color="secondary" className="mt-sm">
            {paidPayments.length} refundable payment{paidPayments.length !== 1 ? 's' : ''}
          </Typography>
        </View>

        <View className="px-screen-padding pt-xl">
          {loading ? (
            <View className="gap-sm">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-24 rounded-2xl" />
              ))}
            </View>
          ) : selectedPayment ? (
            <View className="rounded-2xl border border-border bg-surface p-lg">
              <Typography variant="body" weight="semibold" className="mb-lg text-text-primary">
                Process Refund
              </Typography>

              {error && (
                <View className="mb-md rounded-xl bg-error-light px-md py-sm">
                  <Typography variant="caption" className="text-error">
                    {error}
                  </Typography>
                </View>
              )}

              <Typography variant="body" color="secondary" className="mb-sm">
                Payment: {selectedPayment.transactionReference ?? selectedPayment.id.slice(0, 8)}
              </Typography>
              <Typography variant="body" color="secondary" className="mb-sm">
                Original Amount: ETB {selectedPayment.amount.toFixed(2)}
              </Typography>
              <Typography variant="body" color="secondary" className="mb-sm">
                Already Refunded: ETB {selectedPayment.refundedAmount.toFixed(2)}
              </Typography>
              <Typography variant="body" color="secondary" className="mb-lg">
                Max Refundable: ETB {(selectedPayment.amount - selectedPayment.refundedAmount).toFixed(2)}
              </Typography>

              <Typography variant="body" weight="medium" className="mb-sm text-text-primary">
                Refund Amount
              </Typography>
              <TextInput
                value={refundAmount}
                onChangeText={setRefundAmount}
                placeholder="Amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                className="mb-lg rounded-xl border border-border bg-background px-md py-lg text-body text-text-primary"
                accessibilityLabel="Refund amount"
              />

              <Typography variant="body" weight="medium" className="mb-sm text-text-primary">
                Reason
              </Typography>
              <View className="mb-lg flex-row flex-wrap gap-sm">
                {REFUND_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setRefundReason(r.value)}
                    activeOpacity={0.7}
                    className={[
                      'rounded-full border px-md py-sm',
                      refundReason === r.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface',
                    ].join(' ')}
                  >
                    <Typography
                      variant="caption"
                      weight={refundReason === r.value ? 'semibold' : 'regular'}
                      className={refundReason === r.value ? 'text-primary' : 'text-text-secondary'}
                    >
                      {r.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-sm">
                <TouchableOpacity
                  onPress={() => setSelectedPayment(null)}
                  activeOpacity={0.7}
                  className="flex-1 items-center rounded-full border border-border bg-surface px-lg py-md"
                >
                  <Typography variant="body" weight="medium" className="text-text-primary">
                    Cancel
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitRefund}
                  disabled={submitting}
                  activeOpacity={0.85}
                  className="flex-1 items-center rounded-full bg-purple-600 px-lg py-md"
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  <Typography variant="body" weight="semibold" className="text-background">
                    {submitting ? 'Processing...' : 'Refund'}
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          ) : paidPayments.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-lg py-xl">
              <Typography variant="h1" className="mb-md">✅</Typography>
              <Typography variant="body" weight="semibold" className="text-center text-text-primary">
                No refundable payments
              </Typography>
              <Typography variant="caption" color="secondary" className="mt-sm text-center">
                All payments have already been refunded or are pending.
              </Typography>
            </View>
          ) : (
            paidPayments.map((p) => (
              <PaidPaymentCard
                key={p.id}
                payment={p}
                onRefund={handleRefundPress}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
