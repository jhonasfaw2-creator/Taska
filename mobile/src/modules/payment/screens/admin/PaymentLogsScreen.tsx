import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { SkeletonBlock } from '@/components/SkeletonLoader';
import { Icon } from '@/components/Icon';
import { listAllPayments, getPaymentAuditLogs } from '@/services/payment.service';
import type { Payment, PaymentAuditLog } from '@/types/payment';

function AuditLogCard({ log }: { log: PaymentAuditLog }) {
  return (
    <View className="mb-sm rounded-2xl border border-border bg-surface p-lg">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-sm">
            <Typography variant="body" weight="medium" className="text-text-primary">
              {log.event}
            </Typography>
            <Typography variant="caption" color="secondary">
              #{log.id}
            </Typography>
          </View>
          <Typography variant="caption" color="secondary" className="mt-xs">
            {new Date(log.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </Typography>
        </View>
        <View className="ml-sm items-end">
          {log.fromStatus && (
            <Typography variant="caption" className="text-warning">
              {log.fromStatus}
            </Typography>
          )}
          {log.toStatus && (
            <Typography variant="caption" className="text-success">
              <Icon name="arrowRight" size={12} color="#22C55E" accessibilityLabel="" />
              {log.toStatus}
            </Typography>
          )}
        </View>
      </View>
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <View className="mt-sm rounded-lg bg-background px-md py-sm">
          <Typography variant="caption" color="secondary" className="font-mono">
            {JSON.stringify(log.metadata, null, 2)}
          </Typography>
        </View>
      )}
    </View>
  );
}

export default function PaymentLogsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [logs, setLogs] = useState<PaymentAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPayments = useCallback(async () => {
    try {
      const data = await listAllPayments();
      setPayments(data);
    } catch (err) {
      console.log('[PaymentLogs] Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const loadLogs = useCallback(async (paymentId: string) => {
    setLogsLoading(true);
    try {
      const data = await getPaymentAuditLogs(paymentId);
      setLogs(data);
      setSelectedPaymentId(paymentId);
    } catch (err) {
      console.log('[PaymentLogs] Failed to load logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPayments();
    if (selectedPaymentId) {
      await loadLogs(selectedPaymentId);
    }
    setRefreshing(false);
  }, [loadPayments, loadLogs, selectedPaymentId]);

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      (p.transactionReference ?? '').toLowerCase().includes(q) ||
      p.paymentStatus.toLowerCase().includes(q)
    );
  });

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
            Payment Audit Logs
          </Typography>
          <Typography variant="caption" color="secondary" className="mt-sm">
            {selectedPaymentId ? `Logs for payment ${selectedPaymentId.slice(0, 8)}` : 'Select a payment to view logs'}
          </Typography>
        </View>

        <View className="px-screen-padding pt-lg">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search payments..."
            placeholderTextColor="#9CA3AF"
            className="rounded-xl border border-border bg-surface px-md py-lg text-body text-text-primary"
            accessibilityLabel="Search payments"
          />
        </View>

        <View className="px-screen-padding pt-lg">
          {loading ? (
            <View className="gap-sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-20 rounded-2xl" />
              ))}
            </View>
          ) : logsLoading ? (
            <View className="gap-sm">
              <SkeletonBlock className="h-24 rounded-2xl" />
              <SkeletonBlock className="h-24 rounded-2xl" />
            </View>
          ) : selectedPaymentId && logs.length > 0 ? (
            <View>
              <View className="mb-md flex-row items-center justify-between">
                <Typography variant="body" weight="semibold" className="text-text-primary">
                  Audit Trail
                </Typography>
                <TouchableOpacity
                  onPress={() => setSelectedPaymentId(null)}
                  activeOpacity={0.7}
                >
                  <Typography variant="caption" className="text-primary">
                    Back to list
                  </Typography>
                </TouchableOpacity>
              </View>
              {logs.map((log) => (
                <AuditLogCard key={log.id} log={log} />
              ))}
            </View>
          ) : selectedPaymentId ? (
            <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-lg py-xl">
              <Typography variant="body" color="secondary">
                No audit logs for this payment.
              </Typography>
            </View>
          ) : (
            filteredPayments.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => loadLogs(p.id)}
                activeOpacity={0.7}
                className="mb-sm rounded-2xl border border-border bg-surface p-lg"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Typography variant="body" weight="medium" className="text-text-primary">
                      {p.transactionReference ?? p.id.slice(0, 8)}
                    </Typography>
                    <Typography variant="caption" color="secondary" className="mt-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </Typography>
                  </View>
                  <View className="items-end">
                    <Typography variant="caption" weight="medium" className="text-text-primary">
                      {p.paymentStatus}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      ETB {p.amount.toFixed(2)}
                    </Typography>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
