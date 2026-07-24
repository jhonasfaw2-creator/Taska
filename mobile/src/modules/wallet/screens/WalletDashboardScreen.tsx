import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui';
import { SkeletonBlock } from '@/components/SkeletonLoader';
import { getBalanceSummary, requestWithdrawal } from '@/services/wallet.service';
import type { BalanceSummary } from '@/types/wallet';
import { ApiError } from '@/services';

export default function WalletDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getBalanceSummary();
      setSummary(data);
    } catch (err) {
      console.log('[Wallet] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleWithdraw = useCallback(async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Enter a valid amount');
      return;
    }
    if (summary && amount > summary.withdrawable) {
      setWithdrawError('Amount exceeds withdrawable balance');
      return;
    }
    setWithdrawing(true);
    setWithdrawError(null);
    setWithdrawSuccess(false);
    try {
      await requestWithdrawal({ amount });
      setWithdrawSuccess(true);
      setWithdrawAmount('');
      load();
    } catch (err) {
      setWithdrawError(
        err instanceof ApiError ? err.message : 'Withdrawal failed',
      );
    } finally {
      setWithdrawing(false);
    }
  }, [withdrawAmount, summary, load]);

  if (loading) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="px-screen-padding pt-lg">
          <SkeletonBlock className="mb-xl h-11 w-11 rounded-full" />
          <SkeletonBlock className="mb-md h-8 w-2/5" />
          <SkeletonBlock className="h-48 w-full rounded-2xl" />
        </View>
      </View>
    );
  }

  const curr = summary?.currency ?? 'ETB';

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
            <Typography variant="body" className="text-text-primary">←</Typography>
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            Wallet
          </Typography>
        </View>

        <View className="mx-screen-padding mt-xl rounded-2xl bg-primary p-lg">
          <Typography variant="caption" weight="medium" className="text-background/80">
            Available Balance
          </Typography>
          <Typography variant="display" weight="bold" className="mt-xs text-background">
            {curr} {(summary?.availableBalance ?? 0).toFixed(2)}
          </Typography>
          <View className="mt-md flex-row gap-lg">
            <View className="flex-1">
              <Typography variant="caption" className="text-background/70">
                Pending
              </Typography>
              <Typography variant="body" weight="semibold" className="mt-xs text-background">
                {curr} {(summary?.pendingBalance ?? 0).toFixed(2)}
              </Typography>
            </View>
            <View className="flex-1">
              <Typography variant="caption" className="text-background/70">
                Total Earned
              </Typography>
              <Typography variant="body" weight="semibold" className="mt-xs text-background">
                {curr} {(summary?.totalEarned ?? 0).toFixed(2)}
              </Typography>
            </View>
          </View>
        </View>

        <View className="px-screen-padding pt-xl">
          <View className="gap-sm">
            <View className="flex-row gap-sm">
              <View className="flex-1 rounded-xl border border-border bg-surface p-md">
                <Typography variant="caption" color="secondary">Balance</Typography>
                <Typography variant="body" weight="bold" className="mt-xs text-text-primary">
                  {curr} {(summary?.balance ?? 0).toFixed(2)}
                </Typography>
              </View>
              <View className="flex-1 rounded-xl border border-border bg-surface p-md">
                <Typography variant="caption" color="secondary">Withdrawn</Typography>
                <Typography variant="body" weight="bold" className="mt-xs text-text-primary">
                  {curr} {(summary?.totalWithdrawn ?? 0).toFixed(2)}
                </Typography>
              </View>
            </View>
            <View className="rounded-xl border border-border bg-surface p-md">
              <Typography variant="caption" color="secondary">Refunded</Typography>
              <Typography variant="body" weight="bold" className="mt-xs text-text-primary">
                {curr} {(summary?.totalRefunded ?? 0).toFixed(2)}
              </Typography>
            </View>
          </View>
        </View>

        <View className="px-screen-padding pt-xl">
          <Typography variant="body" weight="semibold" className="mb-md text-text-primary">
            Withdraw Funds
          </Typography>

          <View className="rounded-2xl border border-border bg-surface p-lg">
            {withdrawSuccess && (
              <View className="mb-md rounded-xl bg-green-50 px-md py-sm">
                <Typography variant="caption" className="text-green-700">
                  Withdrawal request submitted successfully.
                </Typography>
              </View>
            )}

            {withdrawError && (
              <View className="mb-md rounded-xl bg-red-50 px-md py-sm">
                <Typography variant="caption" className="text-red-700">
                  {withdrawError}
                </Typography>
              </View>
            )}

            <Typography variant="body" color="secondary" className="mb-sm">
              Withdrawable: {curr} {(summary?.withdrawable ?? 0).toFixed(2)}
            </Typography>

            <TextInput
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder={`Enter amount in ${curr}`}
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              className="mb-md rounded-xl border border-border bg-background px-md py-lg text-body text-text-primary"
              accessibilityLabel="Withdrawal amount"
            />

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Request withdrawal"
              onPress={handleWithdraw}
              disabled={withdrawing}
              activeOpacity={0.85}
              className="w-full items-center rounded-full bg-primary px-lg py-md"
              style={{ opacity: withdrawing ? 0.6 : 1 }}
            >
              <Typography variant="body" weight="semibold" className="text-background">
                {withdrawing ? 'Processing...' : 'Request Withdrawal'}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-screen-padding pt-xl">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push('/withdrawal-history')}
            activeOpacity={0.7}
            className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-lg"
          >
            <View className="flex-row items-center gap-md">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Typography variant="body">📋</Typography>
              </View>
              <View>
                <Typography variant="body" weight="medium" className="text-text-primary">
                  Withdrawal History
                </Typography>
                <Typography variant="caption" color="secondary">
                  View past withdrawals
                </Typography>
              </View>
            </View>
            <Typography variant="body" className="text-text-secondary">→</Typography>
          </TouchableOpacity>
        </View>

        <View className="px-screen-padding pt-md">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push('/earnings')}
            activeOpacity={0.7}
            className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-lg"
          >
            <View className="flex-row items-center gap-md">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Typography variant="body">💰</Typography>
              </View>
              <View>
                <Typography variant="body" weight="medium" className="text-text-primary">
                  Earnings Breakdown
                </Typography>
                <Typography variant="caption" color="secondary">
                  Detailed earnings report
                </Typography>
              </View>
            </View>
            <Typography variant="body" className="text-text-secondary">→</Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
