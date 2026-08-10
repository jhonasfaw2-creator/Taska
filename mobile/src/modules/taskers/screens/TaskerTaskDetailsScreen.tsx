import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';
import { ProgressTimeline, StatusBadge } from '@/components/ProgressTimeline';
import { getTaskById, updateTaskStatus } from '@/services/task.service';
import { onSocketEvent, joinTaskRoom, leaveTaskRoom } from '@/services/socket.service';
import type { TaskResponse, TaskStatus } from '@/types/task';

interface ActionConfig {
  nextStatus: TaskStatus;
  label: string;
  icon: string;
  confirmTitle: string;
  confirmMessage: string;
}

const TASKER_ACTIONS: Record<string, ActionConfig> = {
  ACCEPTED: {
    nextStatus: 'PICKED_UP',
    label: "I've Picked Up the Item",
    icon: '📦',
    confirmTitle: 'Confirm Pickup',
    confirmMessage: 'Have you picked up the item from the pickup location?',
  },
  PICKED_UP: {
    nextStatus: 'IN_PROGRESS',
    label: 'En Route to Destination',
    icon: '🚗',
    confirmTitle: 'Start Delivery',
    confirmMessage: 'Are you on your way to the drop-off location?',
  },
  IN_PROGRESS: {
    nextStatus: 'COMPLETED',
    label: 'Mark as Completed',
    icon: '✅',
    confirmTitle: 'Complete Task',
    confirmMessage: 'Have you delivered the item and completed the task?',
  },
};

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View className="mb-md flex-row items-center gap-sm">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Typography variant="body">{icon}</Typography>
      </View>
      <Typography variant="body" weight="semibold" className="text-text-primary">
        {title}
      </Typography>
    </View>
  );
}

function DetailCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="mb-md overflow-hidden rounded-2xl border border-border bg-surface px-lg py-lg">
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between py-sm">
      <Typography variant="caption" color="secondary" className="flex-[0.4] leading-relaxed">
        {label}
      </Typography>
      <Typography variant="body" weight="medium" className="flex-[0.6] text-right text-text-primary">
        {value}
      </Typography>
    </View>
  );
}

export default function TaskerTaskDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await getTaskById(taskId);
      setTask(data);
    } catch {
      Alert.alert('Error', 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();

    if (taskId) {
      joinTaskRoom(taskId);
    }

    const unsubStatus = onSocketEvent('task_status_changed', (data: any) => {
      if (data.taskId === taskId) {
        loadTask();
      }
    });

    const unsubCancel = onSocketEvent('task_cancelled', (data: any) => {
      if (data.taskId === taskId) {
        loadTask();
      }
    });

    return () => {
      if (taskId) leaveTaskRoom(taskId);
      unsubStatus();
      unsubCancel();
    };
  }, [loadTask, taskId]);

  const handleStatusAction = useCallback(
    async (config: ActionConfig) => {
      if (!task) return;
      Alert.alert(config.confirmTitle, config.confirmMessage, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: config.label,
          onPress: async () => {
            setActionLoading(true);
            try {
              await updateTaskStatus(task.id, config.nextStatus);
              await loadTask();
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Failed to update task status.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]);
    },
    [task, loadTask],
  );

  const handleStartNavigation = useCallback(() => {
    router.push('/navigate-to-pickup');
  }, [router]);

  const handleContactCustomer = useCallback(() => {
    Alert.alert('Contact Customer', 'Call the customer at +251 91 123 4567', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => {
          Linking.openURL('tel:+251911234567').catch(() => {
            Alert.alert('Error', 'Unable to make a phone call on this device.');
          });
        },
      },
    ]);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Typography variant="body" color="secondary">Loading task...</Typography>
      </View>
    );
  }

  if (!task) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-screen-padding">
        <Typography variant="body" color="secondary" className="text-center">Task not found.</Typography>
        <View className="mt-md">
          <Button label="Go Back" variant="outline" radius="lg" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const currentAction = TASKER_ACTIONS[task.status];
  const isTerminal = ['COMPLETED', 'CANCELLED'].includes(task.status);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-screen-padding pt-md">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="tasker-task-details-back"
            className="mb-xl h-10 w-10 items-center justify-center rounded-full active:opacity-60"
            hitSlop={8}
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            {task.title}
          </Typography>

          <View className="mt-sm flex-row items-center gap-sm">
            <StatusBadge status={task.status} />
            <Typography variant="caption" color="secondary">
              ETB {(task.finalPrice ?? task.estimatedPrice).toFixed(2)}
            </Typography>
          </View>
        </View>

        <View className="mx-screen-padding mt-lg rounded-2xl border border-border bg-surface px-lg py-lg">
          <Typography variant="caption" weight="semibold" className="mb-md uppercase tracking-wider text-text-secondary">
            Progress
          </Typography>
          <ProgressTimeline currentStatus={task.status} />
        </View>

        <View className="px-screen-padding pt-xl">
          <SectionHeader icon="📋" title="Task Information" />
          <DetailCard>
            <Typography variant="body" weight="semibold" className="mb-sm text-text-primary">
              {task.title}
            </Typography>
            <Typography variant="caption" color="secondary" className="leading-relaxed">
              {task.description}
            </Typography>

            {task.specialInstructions && (
              <>
                <View className="my-md border-b border-border" />
                <Typography variant="caption" weight="semibold" className="mb-xs uppercase tracking-wide text-primary">
                  Special Instructions
                </Typography>
                <View className="rounded-xl bg-primary/5 px-md py-md">
                  <Typography variant="caption" className="leading-relaxed text-text-primary">
                    {task.specialInstructions}
                  </Typography>
                </View>
              </>
            )}
          </DetailCard>
        </View>

        <View className="px-screen-padding pt-sm">
          <SectionHeader icon="📍" title="Locations" />
          <DetailCard>
            <View className="flex-row gap-md">
              <View className="items-center">
                <View className="h-5 w-5 items-center justify-center rounded-full bg-success/10">
                  <Typography variant="caption" weight="bold" className="text-success" style={{ fontSize: 10 }}>A</Typography>
                </View>
                <View className="my-1 h-8 w-0.5 bg-success/20" />
                <View className="h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Typography variant="caption" weight="bold" className="text-primary" style={{ fontSize: 10 }}>B</Typography>
                </View>
              </View>
              <View className="flex-1 pb-sm">
                <View className="pb-sm">
                  <Typography variant="caption" weight="semibold" className="mb-1 text-success">Pickup Location</Typography>
                  <Typography variant="caption" color="secondary" className="leading-relaxed">{task.pickupAddress}</Typography>
                </View>
                <View className="my-sm border-b border-border" />
                <View className="pt-sm">
                  <Typography variant="caption" weight="semibold" className="mb-1 text-primary">Drop-off Location</Typography>
                  <Typography variant="caption" color="secondary" className="leading-relaxed">{task.dropoffAddress}</Typography>
                </View>
              </View>
            </View>
          </DetailCard>
        </View>

        <View className="px-screen-padding pt-sm">
          <SectionHeader icon="📊" title="Task Summary" />
          <DetailCard>
            <InfoRow label="Estimated Earnings" value={`ETB ${task.estimatedPrice.toFixed(2)}`} />
            <View className="border-b border-border" />
            <InfoRow label="Vehicle Type" value={task.vehicleType} />
          </DetailCard>
        </View>
      </ScrollView>

      <View
        className="border-t border-border bg-background px-screen-padding pb-xl pt-lg"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {currentAction && !isTerminal && (
          <Button
            label={actionLoading ? 'Updating...' : currentAction.label}
            radius="lg"
            shadow="lg"
            loading={actionLoading}
            disabled={actionLoading}
            leftIcon={<Typography variant="body" className="text-background">{currentAction.icon}</Typography>}
            onPress={() => handleStatusAction(currentAction)}
            testID="tasker-status-action"
          />
        )}

        {task.status === 'ACCEPTED' && (
          <View className="mt-md">
            <Button
              label="Start Navigation"
              variant="outline"
              radius="lg"
              leftIcon={<Typography variant="body" className="text-primary">🗺️</Typography>}
              onPress={handleStartNavigation}
              testID="tasker-task-details-start-nav"
            />
          </View>
        )}

        {!isTerminal && (
          <View className="mt-md">
            <Button
              label="Contact Customer"
              variant="outline"
              radius="lg"
              leftIcon={<Typography variant="body" className="text-primary">💬</Typography>}
              onPress={handleContactCustomer}
              testID="tasker-task-details-contact"
            />
          </View>
        )}
      </View>
    </View>
  );
}
