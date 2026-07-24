import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonBlock } from '@/components/SkeletonLoader';
import { getTransactions } from '@/services/wallet.service';
import type { WalletTransaction } from '@/types/wallet';

function WithdrawalCard({ tx }: { tx: WalletTransaction }) {
  return (
    <View className="mb-sm rounded-2xl border border-border bg-surface p-lg">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-sm">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Typography variant="body">🏦</Typography>
            </View>
            <View className="flex-1">
              <Typography variant="body" weight="medium" className="text-text-primary">
                Withdrawal
              </Typography>
              <Typography variant="caption" color="secondary">
                {new Date(tx.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </View>
          </View>
        </View>
        <View className="items-end">
          <Typography variant="body" weight="bold" className="text-text-primary">
            -ETB {tx.amount.toFixed(2)}
          </Typography>
          <Typography variant="caption" color="secondary" className="mt-xs">
            {tx.status}
          </Typography>
        </View>
      </View>
    </View>
  );
}

export default function WithdrawalHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [withdrawals, setWithdrawals] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getTransactions(100, 0);
      setWithdrawals(
        data.transactions.filter(
          (tx) => tx.type === 'WITHDRAWAL',
        ),
      );
    } catch (err) {
      console.log('[WithdrawalHistory] Failed to load:', err);
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
            tintColor="#4F46E5"
            colors={['#4F46E5']}
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
            <Typography variant="body" className="text-text-primary">←</Typography>
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            Withdrawal History
          </Typography>
          <Typography variant="caption" color="secondary" className="mt-sm">
            {withdrawals.length} withdrawal{withdrawals.length !== 1 ? 's' : ''}
          </Typography>
        </View>

        <View className="px-screen-padding pt-xl">
          {loading ? (
            <View className="gap-sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-20 rounded-2xl" />
              ))}
            </View>
          ) : withdrawals.length === 0 ? (
            <EmptyState
              icon="🏦"
              title="No withdrawals yet"
              subtitle="Withdraw your earnings to see history here."
            />
          ) : (
            withdrawals.map((tx) => (
              <WithdrawalCard key={tx.id} tx={tx} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
