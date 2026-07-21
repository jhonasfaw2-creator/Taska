import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui';
import { fetchRecentTasks } from '@/services/task.service';
import type { RecentTask } from '@/types/task';

// ── Status Helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: 'bg-primary/10', text: 'text-primary', label: 'In Progress' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    SEARCHING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Searching' },
    ACCEPTED: { bg: 'bg-primary/10', text: 'text-primary', label: 'Accepted' },
    PICKED_UP: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Picked Up' },
    IN_PROGRESS: { bg: 'bg-primary/10', text: 'text-primary', label: 'In Progress' },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    CANCELLED: { bg: 'bg-text-secondary/10', text: 'text-text-secondary', label: 'Cancelled' },
  };

  const c = config[status] ?? config.PENDING;

  return (
    <View className={`rounded-full px-sm py-px ${c.bg}`}>
      <Typography variant="caption" weight="semibold" className={c.text} style={{ fontSize: 10 }}>
        {c.label}
      </Typography>
    </View>
  );
}

function TaskCard({ task, onPress }: { task: RecentTask; onPress: () => void }) {
  const isActive = !['COMPLETED', 'CANCELLED'].includes(task.status);
  const amount = task.finalPrice ?? task.estimatedPrice;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Task: ${task.title}`}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`task-card-${task.id}`}
      className="mb-sm overflow-hidden rounded-2xl border border-border bg-surface active:opacity-80"
    >
      {/* Top row */}
      <View className="flex-row items-center justify-between px-lg pt-lg pb-md">
        <View className="flex-1">
          <Typography variant="body" weight="semibold" className="text-text-primary" numberOfLines={1}>
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

      {/* Divider */}
      <View className="mx-lg border-b border-border" />

      {/* Bottom row */}
      <View className="flex-row items-center justify-between px-lg py-md">
        <View className="flex-1">
          {isActive && (
            <View className="flex-row items-center gap-1">
              <Typography variant="caption" className="text-text-secondary">🔄</Typography>
              <Typography variant="caption" color="secondary">
                In progress
              </Typography>
            </View>
          )}
        </View>

        {/* Amount */}
        <View className="ml-md items-end">
          <Typography variant="body" weight="bold" className="text-primary">
            ETB {amount.toFixed(2)}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );
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

// ── Status filter mapping ────────────────────────────────────────────────────

const ACTIVE_STATUSES = new Set(['PENDING', 'SEARCHING', 'ACCEPTED', 'PICKED_UP', 'IN_PROGRESS']);
const COMPLETED_STATUSES = new Set(['COMPLETED', 'CANCELLED']);

type FilterKey = 'all' | 'active' | 'completed';

function filterTasks(tasks: RecentTask[], filter: FilterKey): RecentTask[] {
  if (filter === 'active') return tasks.filter((t) => ACTIVE_STATUSES.has(t.status));
  if (filter === 'completed') return tasks.filter((t) => COMPLETED_STATUSES.has(t.status));
  return tasks;
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function TaskHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<RecentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchRecentTasks()
      .then((data) => {
        if (mounted) setTasks(data);
      })
      .catch(() => {
        // API error — show empty state
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const filteredTasks = filterTasks(tasks, filter);
  const activeCount = tasks.filter((t) => ACTIVE_STATUSES.has(t.status)).length;

  const handleTaskPress = useCallback(
    (task: RecentTask) => {
      if (ACTIVE_STATUSES.has(task.status)) {
        router.push('/live-tracking');
      }
      // For completed/cancelled, could navigate to a task detail screen
    },
    [router],
  );

  const handleCreateTask = useCallback(() => {
    router.push('/customer-home');
  }, [router]);

  const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: `Active${activeCount > 0 ? ` (${activeCount})` : ''}` },
    { key: 'completed', label: 'Completed' },
  ];

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
        {/* ── Header ────────────────────────────────────────────── */}
        <View className="px-screen-padding pt-md">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="task-history-back"
            className="mb-xl h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
            hitSlop={8}
          >
            <Typography variant="body" weight="medium" className="text-text-primary">
              ←
            </Typography>
          </TouchableOpacity>

          <Typography variant="h2" weight="bold" className="text-text-primary">
            My Tasks
          </Typography>
          <View className="mt-sm">
            <Typography variant="body" color="secondary" className="leading-relaxed">
              View and track all your tasks in one place.
            </Typography>
          </View>
        </View>

        {/* ── Filter Tabs ──────────────────────────────────────────── */}
        <View className="mx-screen-padding mt-lg flex-row gap-sm rounded-2xl border border-border bg-surface p-sm">
          {tabs.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                accessibilityRole="button"
                accessibilityLabel={`Show ${tab.label} tasks`}
                onPress={() => setFilter(tab.key)}
                testID={`task-history-tab-${tab.key}`}
                activeOpacity={0.7}
                className={`flex-1 items-center rounded-xl py-md ${
                  isActive ? 'bg-primary shadow-sm' : ''
                }`}
              >
                <Typography
                  variant="caption"
                  weight="semibold"
                  className={isActive ? 'text-background' : 'text-text-secondary'}
                >
                  {tab.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Task List ──────────────────────────────────────────── */}
        <View className="px-screen-padding pt-lg">
          {loading ? (
            <View className="gap-sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <View
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-surface"
                />
              ))}
            </View>
          ) : filteredTasks.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-lg py-xl">
              <View className="mb-md h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Typography variant="h1">📋</Typography>
              </View>
              <Typography variant="body" weight="semibold" className="text-center text-text-primary">
                No tasks found
              </Typography>
              <Typography variant="caption" color="secondary" className="mt-sm max-w-xs text-center leading-relaxed">
                {filter === 'active'
                  ? 'You have no active tasks right now. Create a new task to get started.'
                  : filter === 'completed'
                    ? 'You have no completed tasks yet.'
                    : 'No tasks to display. Create your first task!'}
              </Typography>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onPress={() => handleTaskPress(task)} />
            ))
          )}
        </View>

        {/* Bottom spacing */}
        <View className="h-lg" />
      </ScrollView>

      {/* ── Quick Create ──────────────────────────────────────────── */}
      <View
        className="border-t border-border bg-background px-screen-padding pb-xl pt-lg"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Create new task"
          onPress={handleCreateTask}
          testID="task-history-create"
          activeOpacity={0.85}
          className="flex-row items-center justify-center gap-sm rounded-2xl bg-primary py-lg"
          style={{
            shadowColor: '#4F46E5',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Typography variant="body" className="text-background">+</Typography>
          <Typography variant="body" weight="semibold" className="text-background">
            Create New Task
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}
