import { useCallback, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Typography } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTaskContext } from '@/store/TaskContext';
import { VEHICLES } from '@/data/vehicles';
import { createTask, updateTaskStatus } from '@/services/task.service';
import { Icon, type MobileIconName } from '@/components/Icon';

function SummaryCard({
  title,
  children,
  testID,
}: {
  title: string;
  children: React.ReactNode;
  testID: string;
}) {
  return (
    <View
      testID={testID}
      className="mb-md overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <View className="border-b border-border bg-surface-secondary/50 px-lg py-md">
        <Typography
          variant="caption"
          weight="semibold"
          className="uppercase tracking-wider text-text-secondary"
        >
          {title}
        </Typography>
      </View>
      {children}
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  editRoute,
  testID,
}: {
  icon: MobileIconName;
  label: string;
  value: string;
  editRoute?: string;
  testID: string;
}) {
  const router = useRouter();

  return (
    <View
      testID={testID}
      className="flex-row items-center border-b border-border px-lg py-md last:border-b-0"
    >
      <View className="mr-md h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon name={icon} size={20} color="#2563EB" accessibilityLabel="" />
      </View>

      <View className="flex-1">
        <Typography variant="caption" color="secondary" className="uppercase tracking-wide">
          {label}
        </Typography>
        <Typography variant="body" weight="medium" className="mt-px text-text-primary">
          {value}
        </Typography>
      </View>

      {editRoute && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Edit ${label}`}
          onPress={() => router.push(editRoute as any)}
          testID={`${testID}-edit`}
          className="ml-sm rounded-lg px-sm py-xs active:opacity-60"
          hitSlop={8}
        >
          <Typography variant="caption" weight="semibold" className="text-primary">
            Edit
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ReviewTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, resetTask } = useTaskContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicleName = state.vehicleType
    ? VEHICLES.find((v) => v.id === state.vehicleType)?.name ?? state.vehicleType
    : 'Not specified';

  const vehicleIcon = state.vehicleType
    ? VEHICLES.find((v) => v.id === state.vehicleType)?.icon ?? 'car'
    : 'car';

  const photoText =
    state.images.length === 0
      ? 'No photos'
      : `${state.images.length} photo${state.images.length !== 1 ? 's' : ''}`;

  const handlePostTask = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const created = await createTask(state);

      try {
        await updateTaskStatus(created.id, 'SEARCHING');
      } catch {
        // Non-critical: task is already PENDING and visible
      }

      resetTask();
      router.replace(`/searching-tasker?taskId=${created.id}`);
    } catch (error: any) {
      const message = error?.message ?? 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, state, resetTask, router]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Review your task"
          subtitle="Please confirm the details before posting."
        />

        <View className="flex-1 px-screen-padding pt-lg">
          <SummaryCard title="Task" testID="review-card-task">
            <SummaryRow
              icon="folder"
              label="Category"
              value={state.category?.title ?? 'Not selected'}
              editRoute="/choose-category"
              testID="review-row-category"
            />
            <SummaryRow
              icon="tasks"
              label="Task title"
              value={state.title || 'Not provided'}
              editRoute="/task-details"
              testID="review-row-title"
            />
            <SummaryRow
              icon="document"
              label="Description"
              value={
                state.description
                  ? state.description.length > 80
                    ? state.description.slice(0, 80) + '...'
                    : state.description
                  : 'Not provided'
              }
              editRoute="/task-details"
              testID="review-row-description"
            />
            {state.specialInstructions ? (
              <SummaryRow
                icon="pin"
                label="Special instructions"
                value={
                  state.specialInstructions.length > 80
                    ? state.specialInstructions.slice(0, 80) + '...'
                    : state.specialInstructions
                }
                editRoute="/task-details"
                testID="review-row-instructions"
              />
            ) : null}
            <SummaryRow
              icon={vehicleIcon}
              label="Vehicle type"
              value={vehicleName}
              editRoute="/vehicle-type"
              testID="review-row-vehicle"
            />
            <SummaryRow
              icon="image"
              label="Photos"
              value={photoText}
              editRoute="/upload-photos"
              testID="review-row-photos"
            />
          </SummaryCard>

          <SummaryCard title="Location" testID="review-card-location">
            <SummaryRow
              icon="mapPin"
              label="Pickup location"
              value={state.pickup?.address ?? 'Not set'}
              editRoute="/location"
              testID="review-row-pickup"
            />
            <SummaryRow
              icon="target"
              label="Drop-off location"
              value={state.dropoff?.address ?? 'Not set'}
              editRoute="/location"
              testID="review-row-dropoff"
            />
          </SummaryCard>

          {state.images.length > 0 && (
            <SummaryCard title="Photos Preview" testID="review-card-photos">
              <View className="flex-row flex-wrap px-lg py-md" style={{ margin: -4 }}>
                {state.images.map((image) => (
                  <View
                    key={image.id}
                    style={{ width: '20%', aspectRatio: 1, padding: 4 }}
                  >
                    <Image
                      source={{ uri: image.uri }}
                      className="h-full w-full rounded-lg"
                      style={{ resizeMode: 'cover', backgroundColor: '#F3F4F6' }}
                    />
                  </View>
                ))}
              </View>
            </SummaryCard>
          )}
        </View>
      </ScrollView>

      <View className="gap-md border-t border-border bg-background px-screen-padding pb-xl pt-lg">
        <Button
          label={isSubmitting ? 'Posting...' : 'Post Task'}
          radius="lg"
          shadow="lg"
          disabled={isSubmitting}
          onPress={handlePostTask}
          testID="review-task-post"
        />
        <Button
          label="Back"
          variant="outline"
          radius="lg"
          disabled={isSubmitting}
          onPress={() => router.back()}
          testID="review-task-back-bottom"
        />
      </View>
    </View>
  );
}
