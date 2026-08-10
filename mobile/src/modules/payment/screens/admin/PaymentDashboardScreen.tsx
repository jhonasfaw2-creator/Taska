import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { SkeletonBlock } from '@/components/SkeletonLoader';
import { listAllPayments } from '@/services/payment.service';
import type { Payment } from '@/types/payment';

interface PaymentStats {
  total: number;
  totalRevenue: number;
  totalFees: number;
  paid: number;
  pending: number;
  failed: number;
  refunded: number;
}

function computeStats(payments: Payment[]): PaymentStats {
  const stats: PaymentStats = {
    total: payments.length,
    totalRevenue: 0,
    totalFees: 0,
    paid: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
  };
  for (const p of payments) {
    if (p.paymentStatus === 'PAID') {
      stats.paid++;
      stats.totalRevenue += p.amount;
      stats.totalFees += p.platformFee;
    } else if (['PENDING', 'PROCESSING'].includes(p.paymentStatus)) {
      stats.pending++;
    } else if (p.paymentStatus === 'FAILED') {
      stats.failed++;
    } else if (['REFUNDED', 'PARTIALLY_REFUNDED'].includes(p.paymentStatus)) {
      stats.refunded++;
    }
  }
  return stats;
}

function AdminStatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-1 rounded-xl border border-border bg-surface p-md">
      <Typography variant="caption" color="secondary">{label}</Typography>
      <Typography variant="body" weight="bold" className={`mt-xs ${color}`}>
        {value}
      </Typography>
    </View>
  );
}

function PaymentRow({
  payment,
  onPress,
}: {
  payment: Payment;
  onPress: () => void;
}) {
  const statusColor: Record<string, string> = {
    PAID: 'text-success',
    PENDING: 'text-warning',
    PROCESSING: 'text-primary',
    FAILED: 'text-error',
    REFUNDED: 'text-primary',
    CANCELLED: 'text-text-secondary',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-sm rounded-2xl border border-border bg-surface p-lg"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Typography variant="body" weight="semibold" className="text-text-primary">
            Payment {payment.transactionReference ?? payment.id.slice(0, 8)}
          </Typography>
          <Typography variant="caption" color="secondary" className="mt-xs">
            {new Date(payment.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
          <Typography
            variant="caption"
            weight="medium"
            className={`mt-xs ${statusColor[payment.paymentStatus] ?? 'text-text-secondary'}`}
          >
            {payment.paymentStatus}
          </Typography>
        </View>
        <View className="ml-sm items-end">
          <Typography variant="body" weight="bold" className="text-text-primary">
            ETB {payment.amount.toFixed(2)}
          </Typography>
          <Typography variant="caption" color="secondary">
            Fee: ETB {payment.platformFee.toFixed(2)}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PaymentDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listAllPayments();
      setPayments(data);
    } catch (err) {
      console.log('[Admin Payments] Failed to load:', err);
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

  const stats = computeStats(payments);

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
            <ArrowLeft size={24} className="text-text-primary" />
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            Payment Dashboard
          </Typography>
          <Typography variant="caption" color="secondary" className="mt-sm">
            {payments.length} total payments
          </Typography>
        </View>

        <View className="px-screen-padding pt-xl">
          {loading ? (
            <View className="gap-sm">
              <SkeletonBlock className="h-24 w-full rounded-2xl" />
              <SkeletonBlock className="h-24 w-full rounded-2xl" />
            </View>
          ) : (
            <>
              <View className="mb-lg gap-sm">
                <View className="flex-row gap-sm">
                <AdminStatCard
                  label="Revenue"
                  value={`ETB ${stats.totalRevenue.toFixed(2)}`}
                  color="text-success"
                />
                <AdminStatCard
                  label="Fees"
                  value={`ETB ${stats.totalFees.toFixed(2)}`}
                  color="text-primary"
                />
              </View>
              <View className="flex-row gap-sm">
                <AdminStatCard
                  label="Paid"
                  value={String(stats.paid)}
                  color="text-success"
                />
                <AdminStatCard
                  label="Pending"
                  value={String(stats.pending)}
                  color="text-warning"
                />
                <AdminStatCard
                  label="Failed"
                  value={String(stats.failed)}
                  color="text-error"
                />
                <AdminStatCard
                  label="Refunded"
                  value={String(stats.refunded)}
                  color="text-primary"
                />
                </View>
              </View>

              <View className="flex-row gap-sm">
                <TouchableOpacity
                  onPress={() => router.push('/admin/refund-management')}
                  activeOpacity={0.7}
                  className="flex-1 flex-row items-center justify-center gap-sm rounded-xl border border-border bg-surface py-md"
                >
                  <Typography variant="body">💳</Typography>
                  <Typography variant="body" weight="medium" className="text-text-primary">
                    Refunds
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/admin/payment-logs')}
                  activeOpacity={0.7}
                  className="flex-1 flex-row items-center justify-center gap-sm rounded-xl border border-border bg-surface py-md"
                >
                  <Typography variant="body">📋</Typography>
                  <Typography variant="body" weight="medium" className="text-text-primary">
                    Audit Logs
                  </Typography>
                </TouchableOpacity>
              </View>

              <View className="pt-xl">
                <Typography variant="body" weight="semibold" className="mb-md text-text-primary">
                  All Payments
                </Typography>
                {payments.map((p) => (
                  <PaymentRow
                    key={p.id}
                    payment={p}
                    onPress={() => router.push(`/receipt?paymentId=${p.id}`)}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
