import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { ProgressTimeline, StatusBadge } from '@/components/ProgressTimeline';
import { useTaskContext } from '@/store/TaskContext';
import { getTaskById, updateTaskStatus } from '@/services/task.service';
import { onSocketEvent, joinTaskRoom, leaveTaskRoom } from '@/services/socket.service';
import type { TaskResponse } from '@/types/task';

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 500;
const INSTRUCTIONS_MAX = 300;

// ── Creation Mode (no taskId) ────────────────────────────────────────────────

function TaskCreationForm({ onContinue }: { onContinue: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setTitle, setDescription, setSpecialInstructions } = useTaskContext();
  const [titleTouched, setTitleTouched] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  const trimmedTitle = state.title.trim();
  const trimmedDescription = state.description.trim();
  const titleEmpty = trimmedTitle.length === 0;
  const descriptionEmpty = trimmedDescription.length === 0;
  const titleError = titleTouched && titleEmpty ? 'Please enter a task title.' : undefined;
  const descriptionError =
    descriptionTouched && descriptionEmpty ? 'Please enter a task description.' : undefined;
  const canContinue = !titleEmpty && !descriptionEmpty;

  return (
    <ScrollView
      className="flex-1 bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScreenHeader
        title="Task details"
        subtitle="Help the tasker understand what needs to be done."
      />

      <View className="flex-1 px-screen-padding pt-xl">
        <FormField
          label="Task title"
          required
          value={state.title}
          onChangeText={setTitle}
          onBlur={() => setTitleTouched(true)}
          placeholder="e.g., Grocery shopping for the week"
          returnKeyType="next"
          testID="task-title-input"
          nativeID="task-title"
          accessibilityLabel="Task title"
          maxLength={TITLE_MAX}
          error={titleError}
          touched={titleTouched}
          characterCount={{ current: state.title.length, max: TITLE_MAX }}
        />

        <FormField
          label="Task description"
          required
          value={state.description}
          onChangeText={setDescription}
          onBlur={() => setDescriptionTouched(true)}
          placeholder="Describe what needs to be done in detail..."
          returnKeyType="next"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          testID="task-description-input"
          nativeID="task-description"
          accessibilityLabel="Task description"
          maxLength={DESCRIPTION_MAX}
          error={descriptionError}
          touched={descriptionTouched}
          characterCount={{ current: state.description.length, max: DESCRIPTION_MAX }}
          className="min-h-[120px]"
        />

        <FormField
          label="Special instructions (optional)"
          value={state.specialInstructions}
          onChangeText={setSpecialInstructions}
          placeholder="Any special requirements, access codes, preferred brands, etc."
          returnKeyType="done"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          testID="task-special-instructions-input"
          nativeID="task-special-instructions"
          accessibilityLabel="Special instructions"
          maxLength={INSTRUCTIONS_MAX}
          characterCount={{ current: state.specialInstructions.length, max: INSTRUCTIONS_MAX }}
          className="min-h-[80px]"
        />

        <View className="mt-md">
          <Typography variant="caption" color="secondary" className="text-center">
            Be as clear as possible to avoid delays.
          </Typography>
        </View>
      </View>

      <View className="gap-md px-screen-padding pb-xl">
        <Button
          label="Continue"
          radius="lg"
          shadow={canContinue ? 'lg' : 'none'}
          disabled={!canContinue}
          onPress={onContinue}
          testID="task-details-continue"
        />
        <Button
          label="Back"
          variant="outline"
          radius="lg"
          onPress={() => router.back()}
          testID="task-details-back-bottom"
        />
      </View>
    </ScrollView>
  );
}

// ── View Mode (has taskId) ───────────────────────────────────────────────────

const CUSTOMER_CANCEL_ALLOWED = new Set(['PENDING', 'SEARCHING']);

function TaskViewMode({
  task,
  onRefresh,
}: {
  task: TaskResponse;
  onRefresh: () => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const canCancel = CUSTOMER_CANCEL_ALLOWED.has(task.status as string);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Task',
      'Are you sure you want to cancel this task? This action cannot be undone.',
      [
        { text: 'Keep Task', style: 'cancel' },
        {
          text: 'Cancel Task',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await updateTaskStatus(task.id, 'CANCELLED');
              onRefresh();
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Failed to cancel task.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  }, [task.id, onRefresh]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header */}
      <View className="px-screen-padding pt-md">
        <View className="mb-md flex-row items-center justify-between">
          <Typography variant="h2" weight="bold" className="flex-1 text-text-primary" numberOfLines={2}>
            {task.title}
          </Typography>
          <StatusBadge status={task.status} />
        </View>

        <View className="flex-row items-center gap-sm">
          <View className="rounded-full bg-primary/10 px-md py-1">
            <Typography variant="caption" weight="semibold" className="text-primary">
              {task.vehicleType}
            </Typography>
          </View>
          <Typography variant="caption" color="secondary">
            ETB {(task.finalPrice ?? task.estimatedPrice).toFixed(2)}
          </Typography>
        </View>
      </View>

      {/* Progress Timeline */}
      <View className="mx-screen-padding mt-lg rounded-2xl border border-border bg-surface px-lg py-lg">
        <Typography
          variant="caption"
          weight="semibold"
          className="mb-md uppercase tracking-wider text-text-secondary"
        >
          Progress
        </Typography>
        <ProgressTimeline currentStatus={task.status} />
      </View>

      {/* Description */}
      {task.description && (
        <View className="mx-screen-padding mt-md rounded-2xl border border-border bg-surface px-lg py-lg">
          <Typography variant="caption" weight="semibold" className="mb-xs uppercase tracking-wide text-text-secondary">
            Description
          </Typography>
          <Typography variant="body" color="secondary" className="leading-relaxed">
            {task.description}
          </Typography>
          {task.specialInstructions && (
            <View className="mt-md rounded-xl bg-primary/5 px-md py-md">
              <Typography variant="caption" weight="semibold" className="mb-xs text-primary">
                Special Instructions
              </Typography>
              <Typography variant="caption" className="leading-relaxed text-text-primary">
                {task.specialInstructions}
              </Typography>
            </View>
          )}
        </View>
      )}

      {/* Locations */}
      <View className="mx-screen-padding mt-md rounded-2xl border border-border bg-surface px-lg py-lg">
        <Typography variant="caption" weight="semibold" className="mb-xs uppercase tracking-wide text-text-secondary">
          Locations
        </Typography>
        <View className="flex-row gap-md">
          <View className="items-center">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-green-100">
              <Typography variant="caption" weight="bold" className="text-green-700" style={{ fontSize: 10 }}>A</Typography>
            </View>
            <View className="my-1 h-8 w-0.5 bg-green-200" />
            <View className="h-5 w-5 items-center justify-center rounded-full bg-primary/10">
              <Typography variant="caption" weight="bold" className="text-primary" style={{ fontSize: 10 }}>B</Typography>
            </View>
          </View>
          <View className="flex-1">
            <Typography variant="caption" weight="semibold" className="mb-1 text-green-700">
              Pickup
            </Typography>
            <Typography variant="caption" color="secondary" className="mb-3 leading-relaxed">
              {task.pickupAddress}
            </Typography>
            <Typography variant="caption" weight="semibold" className="mb-1 text-primary">
              Drop-off
            </Typography>
            <Typography variant="caption" color="secondary" className="leading-relaxed">
              {task.dropoffAddress}
            </Typography>
          </View>
        </View>
      </View>

      {/* Cancel Button */}
      {canCancel && (
        <View className="mx-screen-padding mt-lg">
          <Button
            label={cancelling ? 'Cancelling...' : 'Cancel Task'}
            variant="outline"
            radius="lg"
            disabled={cancelling}
            loading={cancelling}
            onPress={handleCancel}
            testID="task-details-cancel"
          />
        </View>
      )}
    </ScrollView>
  );
}

// ── Root Component ──────────────────────────────────────────────────────────

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();

  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
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
    if (taskId) {
      loadTask();
      // Join the task room for real-time updates
      joinTaskRoom(taskId);

      // Listen for status changes
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
        leaveTaskRoom(taskId);
        unsubStatus();
        unsubCancel();
      };
    } else {
      setLoading(false);
    }
  }, [taskId, loadTask]);

  // Task creation mode (no taskId)
  if (!taskId) {
    return (
      <TaskCreationForm
        onContinue={() => router.push('/location')}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Typography variant="body" color="secondary">
          Loading task details...
        </Typography>
      </View>
    );
  }

  // Error / not found
  if (!task) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-screen-padding">
        <Typography variant="body" color="secondary" className="text-center">
          Task not found.
        </Typography>
        <View className="mt-md">
          <Button label="Go Back" variant="outline" radius="lg" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return <TaskViewMode task={task} onRefresh={loadTask} />;
}
