import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Typography } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonBlock } from '@/components/SkeletonLoader';
import { getTransactions, getBalanceSummary } from '@/services/wallet.service';
import type { WalletTransaction, BalanceSummary } from '@/types/wallet';
import { Icon, type MobileIconName } from '@/components/Icon';

const TX_ICONS: Record<string, MobileIconName> = {
  CREDIT: 'banknote',
  DEBIT: 'card',
  WITHDRAWAL: 'landmark',
  REFUND: 'refresh',
  FEE: 'tasks',
};

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isCredit = tx.type === 'CREDIT';
  return (
    <View className="flex-row items-center justify-between py-sm">
      <View className="flex-row items-center gap-md flex-1">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Typography variant="body">
            <Icon name={TX_ICONS[tx.type] ?? 'card'} size={18} color="#2563EB" accessibilityLabel="" />
          </Typography>
        </View>
        <View className="flex-1">
          <Typography variant="body" weight="medium" className="text-text-primary">
            {tx.description ?? tx.type}
          </Typography>
          <Typography variant="caption" color="secondary">
            {new Date(tx.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </View>
      </View>
      <View className="items-end">
        <Typography
          variant="body"
          weight="semibold"
          className={isCredit ? 'text-success' : 'text-text-primary'}
        >
          {isCredit ? '+' : '-'}ETB {tx.amount.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="secondary">
          {tx.type}
        </Typography>
      </View>
    </View>
  );
}

export default function EarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [txData, summaryData] = await Promise.all([
        getTransactions(100, 0),
        getBalanceSummary(),
      ]);
      setTransactions(txData.transactions);
      setSummary(summaryData);
    } catch (err) {
      console.log('[Earnings] Failed to load:', err);
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

  const curr = summary?.currency ?? 'ETB';
  const credits = transactions.filter((t) => t.type === 'CREDIT');
  const debits = transactions.filter((t) => t.type !== 'CREDIT');
  const totalCredits = credits.reduce((s, t) => s + t.amount, 0);
  const totalDebits = debits.reduce((s, t) => s + t.amount, 0);

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
            Earnings
          </Typography>
          <Typography variant="caption" color="secondary" className="mt-sm">
            Total earned: {curr} {totalCredits.toFixed(2)}
          </Typography>
        </View>

        <View className="px-screen-padding pt-xl">
          <View className="gap-sm">
            <View className="flex-row gap-sm">
              <View className="flex-1 rounded-xl border border-border bg-surface p-md">
                <Typography variant="caption" color="secondary">Credits</Typography>
                <Typography variant="body" weight="bold" className="mt-xs text-success">
                  +{curr} {totalCredits.toFixed(2)}
                </Typography>
              </View>
              <View className="flex-1 rounded-xl border border-border bg-surface p-md">
                <Typography variant="caption" color="secondary">Debits</Typography>
                <Typography variant="body" weight="bold" className="mt-xs text-error">
                  -{curr} {totalDebits.toFixed(2)}
                </Typography>
              </View>
            </View>
            <View className="rounded-xl border border-border bg-surface p-md">
              <Typography variant="caption" color="secondary">Net</Typography>
              <Typography variant="body" weight="bold" className="mt-xs text-text-primary">
                {curr} {(totalCredits - totalDebits).toFixed(2)}
              </Typography>
            </View>
          </View>
        </View>

        <View className="px-screen-padding pt-xl">
          <Typography variant="body" weight="semibold" className="mb-md text-text-primary">
            Transactions
          </Typography>

          {loading ? (
            <View className="gap-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-16 rounded-xl" />
              ))}
            </View>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon="banknote"
              title="No earnings yet"
              subtitle="Complete tasks to start earning."
            />
          ) : (
            <View className="rounded-2xl border border-border bg-surface px-lg">
              {transactions.map((tx, idx) => (
                <View key={tx.id}>
                  <TransactionRow tx={tx} />
                  {idx < transactions.length - 1 && (
                    <View className="h-px bg-border" />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
