import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { HomeSkeleton } from '@/components/SkeletonLoader';
import { useProfile } from '@/hooks/useProfile';
import { useCategories } from '@/hooks/useCategories';
import { useRecentTasks } from '@/hooks/useRecentTasks';
import { useTaskContext } from '@/store/TaskContext';
import { setUnreadCountListener } from '@/services/notification.service';
import { onSocketEvent } from '@/services/socket.service';
import type { Category, RecentTask, TaskStatus as TaskStatusType } from '@/types/task';

const CATEGORY_ICONS: Record<string, string> = {
  delivery: '🚚',
  'document-processing': '📄',
  shopping: '🛒',
  cleaning: '🧹',
  moving: '📦',
  repair: '🔧',
  grocery: '🥦',
  pharmacy: '💊',
  'custom-task': '✨',
};

const STATUS_CONFIG: Record<
  TaskStatusType,
  { bg: string; text: string; label: string }
> = {
  PENDING: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending' },
  SEARCHING: { bg: 'bg-primary/10', text: 'text-primary', label: 'Searching' },
  ACCEPTED: { bg: 'bg-primary/10', text: 'text-primary', label: 'Accepted' },
  PICKED_UP: { bg: 'bg-primary/10', text: 'text-primary', label: 'Picked Up' },
  IN_PROGRESS: { bg: 'bg-primary/10', text: 'text-primary', label: 'In Progress' },
  COMPLETED: { bg: 'bg-success/10', text: 'text-success', label: 'Completed' },
  CANCELLED: { bg: 'bg-text-secondary/10', text: 'text-text-secondary', label: 'Cancelled' },
};

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] ?? '📌';
}

function StatusBadge({ status }: { status: TaskStatusType }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <View className={`rounded-full px-sm py-px ${c.bg}`}>
      <Typography
        variant="caption"
        weight="semibold"
        className={c.text}
        style={{ fontSize: 10 }}
      >
        {c.label}
      </Typography>
    </View>
  );
}

function getPriceDisplay(task: RecentTask): string {
  const amount = task.finalPrice ?? task.estimatedPrice;
  return `ETB ${amount.toFixed(2)}`;
}

function CategoryCard({
  category,
  onPress,
}: {
  category: Category;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="w-24 items-center gap-sm"
      testID={`category-${category.slug}`}
    >
      <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Text className="text-2xl">{getCategoryIcon(category.slug)}</Text>
      </View>
      <Typography
        variant="caption"
        weight="medium"
        className="text-center text-text-primary"
        numberOfLines={2}
      >
        {category.name}
      </Typography>
    </TouchableOpacity>
  );
}

function TaskCard({
  task,
  onPress,
}: {
  task: RecentTask;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Task: ${task.title}`}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`task-card-${task.id}`}
      className="mb-sm overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <View className="flex-row items-center justify-between px-lg pt-lg pb-md">
        <View className="flex-1">
          <Typography
            variant="body"
            weight="semibold"
            className="text-text-primary"
            numberOfLines={1}
          >
            {task.title}
          </Typography>
          <View className="mt-1 flex-row items-center gap-sm">
            <Typography variant="caption" color="secondary">
              {task.categoryName}
            </Typography>
            <View className="h-3 w-px bg-border" />
            <Typography variant="caption" color="secondary">
              {formatDate(task.createdAt)}
            </Typography>
          </View>
        </View>
        <StatusBadge status={task.status} />
      </View>
      <View className="mx-lg border-b border-border" />
      <View className="flex-row items-center justify-between px-lg py-md">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="View task details"
          testID={`task-details-${task.id}`}
          onPress={onPress}
        >
          <Typography variant="caption" weight="semibold" className="text-primary">
            View Details
          </Typography>
        </TouchableOpacity>
        <Typography variant="body" weight="bold" className="text-primary">
          {getPriceDisplay(task)}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

function NotificationButton({
  unreadCount,
  onPress,
}: {
  unreadCount: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      onPress={onPress}
      testID="home-notifications"
      className="h-11 w-11 items-center justify-center rounded-full bg-surface"
      activeOpacity={0.7}
    >
      <Text className="text-lg">🔔</Text>
      {unreadCount > 0 && (
        <View className="absolute -right-1 -top-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1">
          <Text className="text-[10px] font-bold text-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function ErrorSection({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
      <View className="items-center rounded-2xl border border-border bg-error/10 px-lg py-xl">
      <View className="mb-md h-14 w-14 items-center justify-center rounded-full bg-error/10">
        <Text className="text-2xl">⚠️</Text>
      </View>
      <Typography variant="body" weight="semibold" className="text-center text-text-primary">
        Something went wrong
      </Typography>
      <Typography
        variant="caption"
        color="secondary"
        className="mt-sm max-w-xs text-center leading-relaxed"
      >
        {message}
      </Typography>
      <TouchableOpacity
        onPress={onRetry}
        className="mt-md rounded-full bg-primary px-lg py-sm"
        activeOpacity={0.8}
      >
        <Typography variant="caption" weight="semibold" className="text-background">
          Try Again
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

export default function CustomerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [notifUnread, setNotifUnread] = useState(0);
  const { resetTask } = useTaskContext();

  useEffect(() => {
    setUnreadCountListener(setNotifUnread);
  }, []);

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfile();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useRecentTasks();

  // Listen for real-time task events to auto-refresh the task list
  useEffect(() => {
    const unsubCreated = onSocketEvent('task_created', () => {
      refetchTasks();
    });

    const unsubAccepted = onSocketEvent('task_accepted', () => {
      refetchTasks();
    });

    const unsubStatus = onSocketEvent('task_status_changed', () => {
      refetchTasks();
    });

    const unsubCancel = onSocketEvent('task_cancelled', () => {
      refetchTasks();
    });

    const unsubNotif = onSocketEvent('notification_created', () => {
      refetchTasks();
    });

    return () => {
      unsubCreated();
      unsubAccepted();
      unsubStatus();
      unsubCancel();
      unsubNotif();
    };
  }, [refetchTasks]);

  const isLoading = profileLoading || categoriesLoading || tasksLoading;
  const isError = profileError || categoriesError || tasksError;

  const displayName = useMemo(() => {
    if (!profile) return '';
    return profile.firstName;
  }, [profile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchCategories(), refetchTasks()]);
    setRefreshing(false);
  }, [refetchProfile, refetchCategories, refetchTasks]);

  const handleCategoryPress = useCallback(
    (category: Category) => {
      router.push({
        pathname: '/choose-category',
        params: { category: category.slug },
      });
    },
    [router],
  );

  const handleTaskPress = useCallback(
    (task: RecentTask) => {
      router.push({
        pathname: '/task-details',
        params: { taskId: task.id },
      });
    },
    [router],
  );

  const handleCreateTask = useCallback(() => {
    resetTask();
    router.push('/choose-category');
  }, [resetTask, router]);

  const handleSearchPress = useCallback(() => {
    router.push('/choose-category');
  }, [router]);

  const handleNotificationsPress = useCallback(() => {
    router.push('/notifications');
  }, [router]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
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
        {isLoading && !refreshing ? (
          <HomeSkeleton />
        ) : isError && !refreshing ? (
          <View className="px-screen-padding pt-lg">
            <ErrorSection
              message={profileError ?? categoriesError ?? tasksError ?? 'An unexpected error occurred'}
              onRetry={onRefresh}
            />
          </View>
        ) : (
          <>
            <View className="flex-row items-start justify-between px-screen-padding pt-lg">
              <View className="flex-1">
                <Typography variant="h2" weight="bold" className="text-text-primary">
                  {getTimeGreeting()}{displayName ? `, ${displayName}` : ''}
                </Typography>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Change location"
                  className="mt-xs flex-row items-center"
                  activeOpacity={0.7}
                >
                  <Text className="mr-1 text-sm">📍</Text>
                  <Typography variant="caption" color="secondary">
                    Addis Ababa, Ethiopia
                  </Typography>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center gap-sm">
                <NotificationButton
                  unreadCount={notifUnread}
                  onPress={handleNotificationsPress}
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Become a Tasker"
                  onPress={() => router.push('/tasker-become')}
                  testID="home-become-tasker"
                  className="h-11 items-center justify-center rounded-full bg-primary/10 px-md"
                  activeOpacity={0.7}
                >
                  <Typography variant="caption" weight="semibold" className="text-primary" style={{ fontSize: 11 }}>
                    🛵 Tasker
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-screen-padding pt-xl">
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Search for tasks"
                onPress={handleSearchPress}
                activeOpacity={0.85}
                className="flex-row items-center rounded-2xl border border-border bg-surface px-md py-md"
              >
                <Text className="mr-sm text-lg">🔍</Text>
                <Typography variant="body" color="secondary" className="flex-1">
                  What do you need help with?
                </Typography>
              </TouchableOpacity>
            </View>

            <View className="pt-xl">
              <Typography
                variant="h2"
                weight="bold"
                className="mb-md px-screen-padding text-text-primary"
              >
                Quick Categories
              </Typography>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
              >
                {categories.length === 0 ? (
                  <Typography variant="caption" color="secondary" className="py-md">
                    No categories available
                  </Typography>
                ) : (
                  categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onPress={() => handleCategoryPress(category)}
                    />
                  ))
                )}
              </ScrollView>
            </View>

            <View className="px-screen-padding pt-xl">
              <View className="mb-md flex-row items-center justify-between">
                <Typography variant="h2" weight="bold" className="text-text-primary">
                  Recent Tasks
                </Typography>
                {tasks.length > 0 && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="View all tasks"
                    onPress={() => router.push('/task-history')}
                  >
                    <Typography variant="caption" weight="semibold" className="text-primary">
                      See All
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
              {tasks.length === 0 && !tasksLoading ? (
                <EmptyState
                  icon="✨"
                  title="No tasks yet"
                  subtitle="Create your first task and it will show up here."
                />
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={() => handleTaskPress(task)}
                  />
                ))
              )}
            </View>

            <View className="h-lg" />
          </>
        )}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-screen-padding pb-xl pt-lg"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Create new task"
          onPress={handleCreateTask}
          testID="create-task-fab"
          activeOpacity={0.85}
          className="flex-row items-center justify-center gap-sm rounded-2xl bg-primary py-lg"
          style={{
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text className="text-xl text-background">+</Text>
          <Typography variant="body" weight="semibold" className="text-background">
            Create Task
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}
