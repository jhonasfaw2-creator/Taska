import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonBlock } from '@/components/SkeletonLoader';
import { listPayments } from '@/services/payment.service';
import type { Payment } from '@/types/payment';

const STATUS_META: Record<string, { icon: string; color: string }> = {
  PENDING: { icon: '⏳', color: 'text-warning' },
  PROCESSING: { icon: '🔄', color: 'text-primary' },
  AUTHORIZED: { icon: '✓', color: 'text-primary' },
  PAID: { icon: '✅', color: 'text-success' },
  FAILED: { icon: '❌', color: 'text-error' },
  CANCELLED: { icon: '↩️', color: 'text-text-secondary' },
  REFUNDED: { icon: '💳', color: 'text-purple-600' },
  PARTIALLY_REFUNDED: { icon: '💳', color: 'text-purple-400' },
};

function PaymentCard({
  payment,
  onPress,
}: {
  payment: Payment;
  onPress: () => void;
}) {
  const meta = STATUS_META[payment.paymentStatus] ?? { icon: '❓', color: 'text-text-secondary' };
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Payment ${payment.paymentStatus}`}
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-sm rounded-2xl border border-border bg-surface p-lg"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-sm">
            <Typography variant="body">{meta.icon}</Typography>
            <Typography
              variant="body"
              weight="semibold"
              className="flex-1 text-text-primary"
              numberOfLines={1}
            >
              Task Payment
            </Typography>
            <Typography
              variant="caption"
              weight="medium"
              className={meta.color}
            >
              {payment.paymentStatus}
            </Typography>
          </View>
          <Typography variant="caption" color="secondary" className="mt-1">
            {new Date(payment.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        </View>
        <View className="ml-sm items-end">
          <Typography variant="body" weight="bold" className="text-text-primary">
            ETB {payment.amount.toFixed(2)}
          </Typography>
          {payment.paymentMethod && (
            <Typography variant="caption" color="secondary" className="mt-xs">
              {payment.paymentMethod}
            </Typography>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listPayments();
      setPayments(data);
    } catch (err) {
      console.log('[TransactionHistory] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
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
            Transaction History
          </Typography>
          <Typography variant="caption" color="secondary" className="mt-sm">
            {payments.length} transaction{payments.length !== 1 ? 's' : ''}
          </Typography>
        </View>

        <View className="px-screen-padding pt-xl">
          {loading ? (
            <View className="gap-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-24 rounded-2xl" />
              ))}
            </View>
          ) : payments.length === 0 ? (
            <EmptyState
              icon="💳"
              title="No transactions yet"
              subtitle="When you make payments, they will appear here."
            />
          ) : (
            payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onPress={() =>
                  router.push(`/receipt?paymentId=${payment.id}`)
                }
              />
            ))
          )}
        </View>

        <View className="h-lg" />
      </ScrollView>
    </View>
  );
}
