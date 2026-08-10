import { useCallback, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';
import { useTaskContext } from '@/store/TaskContext';
import { VEHICLES } from '@/data/vehicles';
import { createTask } from '@/services/task.service';

interface SummaryRowProps {
  icon: string;
  label: string;
  value: string;
  editRoute?: string;
  testID: string;
}

function SummaryRow({ icon, label, value, editRoute, testID }: SummaryRowProps) {
  const router = useRouter();

  return (
    <View
      testID={testID}
      className="flex-row items-center border-b border-border px-lg py-md last:border-b-0"
    >
      <View className="mr-md h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Typography variant="body" className="text-primary">
          {icon}
        </Typography>
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
          onPress={() => router.push(editRoute as Parameters<typeof router.push>[0])}
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

export default function ConfirmTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useTaskContext();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [posting, setPosting] = useState(false);

  const isValid = isConfirmed && !posting;
  const vehicleName = state.vehicleType
    ? VEHICLES.find((v) => v.id === state.vehicleType)?.name ?? state.vehicleType
    : 'Not specified';
  const photoText = state.images.length === 0
    ? 'No photos'
    : `${state.images.length} photo${state.images.length !== 1 ? 's' : ''}`;

  const handleToggleConfirm = useCallback(() => {
    setIsConfirmed((prev) => !prev);
  }, []);

  const handlePostTask = useCallback(async () => {
    if (!isValid) return;
    setPosting(true);
    try {
      const task = await createTask(state);
      router.replace(`/searching-tasker?taskId=${task.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setPosting(false);
    }
  }, [isValid, state, router]);

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
        <View className="px-screen-padding pt-md">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="confirm-task-back-button"
            className="mb-xl h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
            hitSlop={8}
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            Review your task
          </Typography>

          <View className="mt-sm">
            <Typography variant="body" color="secondary" className="leading-relaxed">
              Please confirm the details before posting.
            </Typography>
          </View>
        </View>

        <View className="flex-1 px-screen-padding pt-lg">
          <SummaryCard title="Task" testID="confirm-card-task">
            <SummaryRow
              icon="📂"
              label="Category"
              value={state.category?.title ?? 'Not selected'}
              editRoute="/choose-category"
              testID="confirm-row-category"
            />
            <SummaryRow
              icon="📋"
              label="Task title"
              value={state.title || 'Not provided'}
              editRoute="/task-details"
              testID="confirm-row-task-title"
            />
            <SummaryRow
              icon="🚗"
              label="Vehicle type"
              value={vehicleName}
              editRoute="/vehicle-type"
              testID="confirm-row-vehicle"
            />
            <SummaryRow
              icon="🖼️"
              label="Photos"
              value={photoText}
              editRoute="/upload-photos"
              testID="confirm-row-photos"
            />
          </SummaryCard>

          <SummaryCard title="Location" testID="confirm-card-location">
            <SummaryRow
              icon="📍"
              label="Pickup location"
              value={state.pickup?.address ?? 'Not set'}
              editRoute="/location"
              testID="confirm-row-pickup"
            />
            <SummaryRow
              icon="🏁"
              label="Drop-off location"
              value={state.dropoff?.address ?? 'Not set'}
              editRoute="/location"
              testID="confirm-row-dropoff"
            />
          </SummaryCard>

          <SummaryCard title="Description" testID="confirm-card-description">
            <View className="px-lg py-md">
              <Typography variant="caption" color="secondary" className="leading-relaxed">
                {state.description || 'No description provided.'}
              </Typography>
              {state.specialInstructions && (
                <View className="mt-md rounded-xl bg-primary/5 px-md py-md">
                  <Typography variant="caption" weight="semibold" className="mb-xs text-primary">
                    Special Instructions
                  </Typography>
                  <Typography variant="caption" className="leading-relaxed text-text-primary">
                    {state.specialInstructions}
                  </Typography>
                </View>
              )}
            </View>
          </SummaryCard>

          <View className="mt-sm mb-lg rounded-2xl border border-border bg-surface px-lg py-md">
            <View className="flex-row items-center gap-md">
              <Switch
                value={isConfirmed}
                onValueChange={handleToggleConfirm}
                trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
                thumbColor={isConfirmed ? '#FFFFFF' : '#F9FAFB'}
                testID="confirm-task-checkbox"
                accessibilityLabel="I confirm that this task follows Taska guidelines"
              />
              <View className="flex-1">
                <Typography
                  variant="body"
                  weight="medium"
                  className="leading-snug text-text-primary"
                >
                  I confirm that this task follows Taska guidelines.
                </Typography>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="gap-md border-t border-border bg-background px-screen-padding pb-xl pt-lg"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          label={posting ? 'Posting...' : 'Post Task'}
          radius="lg"
          shadow={isValid ? 'lg' : 'none'}
          disabled={!isValid}
          loading={posting}
          onPress={handlePostTask}
          testID="confirm-task-post"
        />
        <Button
          label="Back"
          variant="outline"
          radius="lg"
          onPress={() => router.back()}
          testID="confirm-task-back-bottom"
        />
      </View>
    </View>
  );
}
