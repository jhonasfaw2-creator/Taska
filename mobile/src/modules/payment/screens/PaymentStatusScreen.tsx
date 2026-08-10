import { useCallback, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { getPayment, confirmPayment, cancelPayment } from '@/services/payment.service';
import type { Payment } from '@/types/payment';
import { ApiError } from '@/services';

export default function PaymentStatusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { paymentId } = useLocalSearchParams<{
    paymentId: string;
  }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadPayment = useCallback(async () => {
    if (!paymentId) return;
    try {
      const data = await getPayment(paymentId);
      setPayment(data);
      if (['PAID', 'FAILED', 'CANCELLED'].includes(data.paymentStatus)) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch (err) {
      if (!(err instanceof ApiError && err.statusCode === 404)) {
        setError('Failed to load payment status');
      }
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    loadPayment();
    pollingRef.current = setInterval(loadPayment, 3000);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [loadPayment]);

   const handleConfirm = useCallback(async () => {
    if (!paymentId) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await confirmPayment(paymentId);
      setPayment(updated);
    } catch {
      setError('Failed to confirm payment');
    } finally {
      setActionLoading(false);
    }
  }, [paymentId]);

   const handleCancel = useCallback(async () => {
    if (!paymentId) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await cancelPayment(paymentId);
      setPayment(updated);
    } catch {
      setError('Failed to cancel payment');
    } finally {
      setActionLoading(false);
    }
  }, [paymentId]);

  const status = payment?.paymentStatus ?? 'PENDING';

  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return {
          icon: 'clock',
          title: 'Processing Payment',
          subtitle: 'Please wait while we process your payment...',
          color: 'text-primary',
        };
      case 'PAID':
        return {
          icon: 'success',
          title: 'Payment Successful',
          subtitle: 'Your payment has been confirmed successfully.',
          color: 'text-success',
        };
      case 'FAILED':
        return {
          icon: 'error',
          title: 'Payment Failed',
          subtitle: 'Something went wrong. Please try again or use a different payment method.',
          color: 'text-error',
        };
      case 'CANCELLED':
        return {
          icon: 'arrowLeft',
          title: 'Payment Cancelled',
          subtitle: 'This payment has been cancelled.',
          color: 'text-text-secondary',
        };
      case 'REFUNDED':
        return {
          icon: 'card',
          title: 'Payment Refunded',
          subtitle: 'Your payment has been refunded.',
          color: 'text-primary',
        };
      default:
        return {
          icon: 'help',
          title: 'Unknown Status',
          subtitle: 'Payment status unknown.',
          color: 'text-text-secondary',
        };
    }
  };

  const config = getStatusConfig();
  const isTerminal = ['PAID', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(status);
  const isProcessing = ['PENDING', 'PROCESSING'].includes(status);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center justify-center px-screen-padding">
        {loading ? (
          <View className="items-center">
            <Icon name="loading" size={48} color="#2563EB" accessibilityLabel="Loading" />
            <Typography variant="body" color="secondary" className="mt-md">Loading payment status...</Typography>
          </View>
        ) : error && !payment ? (
          <View className="items-center">
            <Icon name="error" size={32} color="#EF4444" accessibilityLabel="Payment failed" />
            <Typography variant="body" weight="semibold" className="text-center text-text-primary">
              {error}
            </Typography>
            <TouchableOpacity
              onPress={loadPayment}
              className="mt-lg rounded-full bg-primary px-xl py-md"
              activeOpacity={0.8}
            >
              <Typography variant="body" weight="semibold" className="text-background">
                Retry
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="w-full items-center">
            <View className="mb-xl h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Typography
                variant="display"
                className={isProcessing ? 'animate-pulse' : ''}
              >
                {config.icon}
              </Typography>
            </View>

            <Typography
              variant="h2"
              weight="bold"
              className={`text-center ${config.color}`}
            >
              {config.title}
            </Typography>

            <Typography
              variant="body"
              color="secondary"
              className="mt-md max-w-xs text-center leading-relaxed"
            >
              {config.subtitle}
            </Typography>

            {payment && (
              <View className="mt-xl w-full rounded-2xl border border-border bg-surface p-lg">
                <View className="flex-row items-center justify-between pb-sm">
                  <Typography variant="caption" color="secondary">
                    Amount
                  </Typography>
                  <Typography variant="body" weight="semibold" className="text-text-primary">
                    ETB {payment.amount.toFixed(2)}
                  </Typography>
                </View>
                <View className="flex-row items-center justify-between pb-sm">
                  <Typography variant="caption" color="secondary">
                    Reference
                  </Typography>
                  <Typography variant="caption" weight="medium" className="text-text-primary">
                    {payment.transactionReference ?? payment.id.slice(0, 8)}
                  </Typography>
                </View>
                <View className="flex-row items-center justify-between">
                  <Typography variant="caption" color="secondary">
                    Date
                  </Typography>
                  <Typography variant="caption" className="text-text-primary">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </Typography>
                </View>
              </View>
            )}

            {isProcessing && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Confirm payment"
                onPress={handleConfirm}
                disabled={actionLoading}
                activeOpacity={0.85}
                className="mt-xl w-full rounded-full bg-primary px-lg py-md"
                style={{ opacity: actionLoading ? 0.6 : 1 }}
              >
                <Typography variant="body" weight="semibold" className="text-center text-background">
                  {actionLoading ? 'Confirming...' : 'Confirm Payment'}
                </Typography>
              </TouchableOpacity>
            )}

            {isProcessing && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Cancel payment"
                onPress={handleCancel}
                disabled={actionLoading}
                className="mt-md rounded-full border border-border bg-surface px-lg py-md"
                activeOpacity={0.7}
              >
                <Typography variant="body" weight="medium" className="text-center text-text-primary">
                  {actionLoading ? 'Cancelling...' : 'Cancel Payment'}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {isTerminal && (
        <View
          className="border-t border-border bg-background px-screen-padding pb-lg pt-md"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          {status === 'PAID' && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="View receipt"
              onPress={() => router.push(`/receipt?paymentId=${paymentId}`)}
              activeOpacity={0.85}
              className="mb-sm w-full rounded-full bg-primary px-lg py-md"
            >
              <Typography variant="body" weight="semibold" className="text-center text-background">
                View Receipt
              </Typography>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Return home"
            onPress={() => router.replace('/customer-home')}
            activeOpacity={0.7}
            className="w-full rounded-full border border-border bg-surface px-lg py-md"
          >
            <Typography variant="body" weight="medium" className="text-center text-text-primary">
              Return Home
            </Typography>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
