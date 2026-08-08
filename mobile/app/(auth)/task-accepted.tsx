import { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';
import { ProgressTimeline } from '@/components/ProgressTimeline';
import { getTaskById } from '@/services/task.service';
import type { TaskResponse } from '@/types/task';

export default function TaskAcceptedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await getTaskById(taskId);
      setTask(data);
    } catch {
      // Task not found — stay with mock-ish state
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleChat = useCallback(() => {
    Alert.alert('Chat', 'Chat feature coming soon.');
  }, []);

  const handleCall = useCallback(() => {
    Linking.openURL('tel:+251911234567').catch(() => {
      Alert.alert('Error', 'Unable to make a phone call on this device.');
    });
  }, []);

  const handleTrackLive = useCallback(() => {
    if (taskId) {
      router.push(`/live-tracking?taskId=${taskId}`);
    } else {
      router.push('/live-tracking');
    }
  }, [router, taskId]);

  const handleViewDetails = useCallback(() => {
    if (taskId) {
      router.push(`/tasker-task-details?taskId=${taskId}`);
    }
  }, [router, taskId]);

  const price = task ? (task.finalPrice ?? task.estimatedPrice) : 0;
  const createdAt = task ? new Date(task.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  const taskIdDisplay = task?.id?.slice(0, 8).toUpperCase() ?? '';

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pt-xl">
          <View className="mb-md h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <Typography variant="h1" className="text-success">✓</Typography>
          </View>
          <Typography variant="h2" weight="bold" className="text-center text-text-primary">
            Task Accepted!
          </Typography>
          <View className="mt-sm px-screen-padding">
            <Typography variant="body" color="secondary" className="text-center leading-relaxed">
              A verified tasker is on the way.
            </Typography>
          </View>
        </View>

        <View className="mx-screen-padding mt-lg overflow-hidden rounded-2xl border border-border bg-surface">
          <View className="flex-row items-center gap-md px-lg pt-lg pb-md">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Typography variant="h1" className="text-primary">👤</Typography>
            </View>
            <View className="flex-1">
              <Typography variant="body" weight="semibold" className="text-text-primary">
                Tasker Assigned
              </Typography>
              <Typography variant="caption" color="secondary">
                A verified tasker will contact you shortly
              </Typography>
            </View>
          </View>
          <View className="mx-lg border-b border-border" />
          <View className="flex-row items-center gap-md px-lg py-md">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Typography variant="body" className="text-primary">🚗</Typography>
            </View>
            <View className="flex-1">
              <Typography variant="caption" color="secondary" className="uppercase tracking-wide">Vehicle</Typography>
              <Typography variant="body" weight="medium" className="mt-px text-text-primary">{task?.vehicleType ?? 'Standard'}</Typography>
            </View>
            <View className="items-end">
              <Typography variant="caption" color="secondary" className="uppercase tracking-wide">Price</Typography>
              <Typography variant="body" weight="bold" className="mt-px text-primary">ETB {price.toFixed(2)}</Typography>
            </View>
          </View>
        </View>

        <View className="mx-screen-padding mt-lg overflow-hidden rounded-2xl border border-border bg-surface px-lg py-lg">
          <Typography variant="caption" weight="semibold" className="mb-md uppercase tracking-wider text-text-secondary">
            Task Status
          </Typography>
          {loading ? (
            <Typography variant="body" color="secondary">Loading progress...</Typography>
          ) : (
            <ProgressTimeline currentStatus={task?.status ?? 'ACCEPTED'} />
          )}
        </View>

        <View className="mx-screen-padding mt-lg flex-row gap-md">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleChat}
            className="flex-1 items-center rounded-xl border border-border bg-surface px-md py-lg active:opacity-70"
          >
            <Typography variant="body" className="mb-xs text-primary">💬</Typography>
            <Typography variant="caption" weight="semibold" className="text-text-primary">Chat</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleCall}
            className="flex-1 items-center rounded-xl border border-border bg-surface px-md py-lg active:opacity-70"
          >
            <Typography variant="body" className="mb-xs text-primary">📞</Typography>
            <Typography variant="caption" weight="semibold" className="text-text-primary">Call</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleViewDetails}
            className="flex-1 items-center rounded-xl border border-border bg-surface px-md py-lg active:opacity-70"
          >
            <Typography variant="body" className="mb-xs text-primary">📋</Typography>
            <Typography variant="caption" weight="semibold" className="text-text-primary">Details</Typography>
          </TouchableOpacity>
        </View>

        {task && (
          <View className="mx-screen-padding mt-lg items-center rounded-2xl border border-border bg-surface px-lg py-md">
            <View className="w-full flex-row items-center justify-between">
              <View>
                <Typography variant="caption" color="secondary" className="uppercase tracking-wide">Task ID</Typography>
                <Typography variant="body" weight="medium" className="mt-px text-text-primary">#{taskIdDisplay}</Typography>
              </View>
              <View className="items-end">
                <Typography variant="caption" color="secondary" className="uppercase tracking-wide">Created</Typography>
                <Typography variant="body" weight="medium" className="mt-px text-text-primary">{createdAt}</Typography>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View
        className="border-t border-border bg-background px-screen-padding pb-xl pt-lg"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          label="Track Live"
          radius="lg"
          shadow="lg"
          leftIcon={<Typography variant="body" className="text-background">🗺️</Typography>}
          onPress={handleTrackLive}
          testID="task-accepted-track-live"
        />
      </View>
    </View>
  );
}
