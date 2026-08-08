import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui';
import { getTaskerProfile, updateOnlineStatus, getNearbyTasks, updateTaskerLocation } from '@/services/tasker.service';
import type { TaskerProfile } from '@/types/tasker';
import { ApiError } from '@/services';
import { onSocketEvent } from '@/services/socket.service';
import { startLocationUpdates, type LocationSubscription } from '@/modules/location/services/location.service';

// ── Types ────────────────────────────────────────────────────────────────────

interface NearbyTask {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedPrice: number;
  customerRating: number | null;
  distanceKm: number;
  status: string;
  createdAt: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  activeIcon: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', activeIcon: '📊' },
  { id: 'tasks', label: 'Tasks', icon: '📋', activeIcon: '📋' },
  { id: 'earnings', label: 'Earnings', icon: '💵', activeIcon: '💵' },
  { id: 'messages', label: 'Messages', icon: '💬', activeIcon: '💬' },
  { id: 'profile', label: 'Profile', icon: '👤', activeIcon: '👤' },
];

const ACTIVE_NAV_ID = 'dashboard';

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-xl border border-border bg-surface px-sm py-lg">
      <View className="mb-sm h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Typography variant="body">{icon}</Typography>
      </View>
      <Typography variant="h2" weight="bold" className="text-text-primary">
        {value}
      </Typography>
      <Typography variant="caption" color="secondary" className="mt-1 text-center leading-tight">
        {label}
      </Typography>
    </View>
  );
}

function NearbyTaskCard({ task, onPress }: { task: NearbyTask; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${task.title} — ETB ${task.estimatedPrice.toFixed(2)}`}
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-sm rounded-xl border border-border bg-surface px-md py-lg"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-sm">
            <Typography variant="body" weight="semibold" className="text-text-primary">
              {task.title}
            </Typography>
            <View className="rounded-full bg-primary/10 px-sm py-px">
              <Typography variant="caption" weight="medium" className="text-primary" style={{ fontSize: 10 }}>
                {task.categoryName}
              </Typography>
            </View>
          </View>
          <View className="mt-1 flex-row items-center gap-md">
            <View className="flex-row items-center gap-1">
              <Typography variant="caption" className="text-text-secondary">📍</Typography>
              <Typography variant="caption" color="secondary" numberOfLines={1}>
                {task.pickupAddress}
              </Typography>
            </View>
            <View className="flex-row items-center gap-1">
              <Typography variant="caption" className="text-text-secondary">📏</Typography>
              <Typography variant="caption" color="secondary">
                {task.distanceKm.toFixed(1)} km
              </Typography>
            </View>
          </View>
          {task.customerRating !== null && (
            <View className="mt-1 flex-row items-center gap-1">
              <Typography variant="caption" className="text-warning">⭐</Typography>
              <Typography variant="caption" weight="semibold" className="text-text-primary">
                {task.customerRating.toFixed(1)}
              </Typography>
            </View>
          )}
        </View>
        <View className="ml-sm items-end">
          <Typography variant="caption" color="secondary">Estimated</Typography>
          <Typography variant="body" weight="bold" className="text-success">
            ETB {task.estimatedPrice.toFixed(2)}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function BottomNavBar({ onPress }: { onPress: (item: { id: string; label: string }) => void }) {
  return (
    <View className="flex-row items-center justify-around border-t border-border bg-background px-md pb-sm pt-md">
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === ACTIVE_NAV_ID;
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            className="items-center px-sm"
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
            testID={`nav-${item.id}`}
            onPress={() => onPress(item)}
          >
            <View
              className={[
                'mb-1 h-8 w-8 items-center justify-center rounded-full',
                isActive ? 'bg-primary/10' : '',
              ].join(' ')}
            >
              <Typography variant="body" className={isActive ? '' : 'opacity-50'}>
                {isActive ? item.activeIcon : item.icon}
              </Typography>
            </View>
            <Typography
              variant="caption"
              weight={isActive ? 'semibold' : 'regular'}
              className={isActive ? 'text-primary' : 'text-text-secondary'}
              style={{ fontSize: 10 }}
            >
              {item.label}
            </Typography>
            {isActive && <View className="mt-1 h-1 w-1 rounded-full bg-primary" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function TaskerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<TaskerProfile | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [nearbyTasks, setNearbyTasks] = useState<NearbyTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Fetch tasker profile on mount
  useEffect(() => {
    let mounted = true;
    getTaskerProfile()
      .then((data) => {
        if (mounted) {
          setProfile(data);
          setIsOnline(data.isOnline);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.statusCode === 404) {
          // Profile not found — user hasn't applied yet
        }
      });
    return () => { mounted = false; };
  }, []);

  // Fetch available tasks when online
  useEffect(() => {
    if (!isOnline) {
      setNearbyTasks([]);
      return;
    }

    let mounted = true;
    const subscriptionRef = { current: null as LocationSubscription | null };
    setTasksLoading(true);
    setTasksError(null);

    const fetchNearby = () => {
      getNearbyTasks({ radiusKm: 10 })
        .then((data) => {
          if (mounted) {
            setNearbyTasks(data);
          }
        })
        .catch((err) => {
          if (mounted) {
            if (err instanceof ApiError && (err.statusCode === 403 || err.statusCode === 404)) {
              setNearbyTasks([]);
            } else {
              setTasksError(err instanceof Error ? err.message : 'Failed to load tasks');
            }
          }
        })
        .finally(() => {
          if (mounted) {
            setTasksLoading(false);
          }
        });
    };

    fetchNearby();

    if (Platform.OS !== 'web') {
      startLocationUpdates(
        async (data) => {
          try {
            await updateTaskerLocation(data.coords.latitude, data.coords.longitude);
          } catch {
            // Silently fail location updates
          }
        },
        'high',
      ).then((sub) => {
        subscriptionRef.current = sub;
      }).catch(() => {
        // Location permission not granted — updates not available
      });
    }

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, [isOnline]);

  // Listen for real-time task events to auto-refresh available tasks
  useEffect(() => {
    if (!isOnline) return;

    const fetchNearby = () => {
      getNearbyTasks({ radiusKm: 10 })
        .then((data) => setNearbyTasks(data))
        .catch(() => {});
    };

    const unsubCreated = onSocketEvent('task_created', fetchNearby);
    const unsubAccepted = onSocketEvent('task_accepted', fetchNearby);
    const unsubCancelled = onSocketEvent('task_cancelled', fetchNearby);

    return () => {
      unsubCreated();
      unsubAccepted();
      unsubCancelled();
    };
  }, [isOnline]);

  const toggleOnline = useCallback(async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      const updated = await updateOnlineStatus(newStatus);
      setIsOnline(updated.isOnline);
    } catch {
      setIsOnline(!newStatus);
    }
  }, [isOnline]);

  const handleNavPress = useCallback((item: { id: string; label: string }) => {
    if (item.id === 'dashboard') {
      return;
    }
    if (item.id === 'tasks') {
      router.push('/task-history');
    } else if (item.id === 'profile') {
      router.push('/create-profile');
    } else {
      Alert.alert('Coming Soon', `${item.label} will be available in a future update.`);
    }
  }, [router]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stats = [
    { id: 'tasks', label: 'Completed Tasks', value: String(profile?.totalTasksCompleted ?? 0), icon: '✅' },
    { id: 'rating', label: 'Rating', value: profile?.rating ? profile.rating.toFixed(1) : '—', icon: '⭐' },
    { id: 'earnings', label: 'Earnings', value: 'ETB 0', icon: '💰' },
  ];

  const displayName = profile?.userId ? 'Tasker' : 'Tasker';

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <View
          className="bg-primary px-screen-padding pb-xl pt-lg"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-md">
              <View className="h-14 w-14 items-center justify-center rounded-full border-2 border-background/30 bg-background/20">
                <Typography variant="h2" className="opacity-90">👤</Typography>
              </View>
              <View>
                <Typography
                  variant="caption"
                  weight="medium"
                  className="text-background/80"
                  style={{ fontSize: 13 }}
                >
                  {getGreeting()}
                </Typography>
                <Typography variant="h2" weight="bold" className="mt-px text-background">
                  {displayName}
                </Typography>
              </View>
            </View>

            <View className="flex-row items-center gap-sm">
              <View className="flex-row items-center gap-1">
                <View className={['h-2 w-2 rounded-full', isOnline ? 'bg-success' : 'bg-text-secondary/40'].join(' ')} />
                <Typography variant="caption" weight="medium" className="text-background/80" style={{ fontSize: 11 }}>
                  {isOnline ? 'Online' : 'Offline'}
                </Typography>
              </View>
              <Switch
                value={isOnline}
                onValueChange={toggleOnline}
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.5)' }}
                thumbColor={isOnline ? '#FFFFFF' : '#D1D5DB'}
                accessibilityRole="switch"
                accessibilityLabel="Toggle online status"
                testID="dashboard-online-toggle"
              />
            </View>
          </View>
        </View>

        {/* ── Status Card ─────────────────────────────────────────── */}
        <View className="mx-screen-padding -mt-md rounded-2xl border border-border bg-surface p-lg shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-md">
              <View
                className={[
                  'h-12 w-12 items-center justify-center rounded-full',
                  isOnline ? 'bg-success/10' : 'bg-text-secondary/10',
                ].join(' ')}
              >
                <Typography variant="h2">{isOnline ? '🟢' : '⭕'}</Typography>
              </View>
              <View>
                <Typography variant="body" weight="semibold" className="text-text-primary">
                  {isOnline ? 'Waiting for tasks' : 'You are offline'}
                </Typography>
                <Typography variant="caption" color="secondary" className="mt-0.5">
                  {isOnline
                    ? 'Nearby tasks will appear here'
                    : 'Go online to start receiving tasks'}
                </Typography>
              </View>
            </View>

            {isOnline && (
              <View className="rounded-full bg-success/10 px-sm py-xs">
                <Typography variant="caption" weight="semibold" className="text-success">
                  Listening
                </Typography>
              </View>
            )}
          </View>

          {isOnline && (
            <View className="mt-md flex-row items-center gap-sm rounded-lg bg-primary/5 px-sm py-sm">
              <Typography variant="caption" className="text-primary">⏱</Typography>
              <Typography variant="caption" className="text-primary">
                Online today: 0 min
              </Typography>
            </View>
          )}
        </View>

        {/* ── Statistics Row ──────────────────────────────────────── */}
        <View className="px-screen-padding pt-xl">
          <Typography variant="body" weight="semibold" className="mb-md text-text-primary">
            Overview
          </Typography>
          <View className="flex-row gap-sm">
            {stats.map((stat) => (
              <StatCard key={stat.id} icon={stat.icon} label={stat.label} value={stat.value} />
            ))}
          </View>
        </View>

        {/* ── Current Status ──────────────────────────────────────── */}
        <View className="px-screen-padding pt-xl">
          <Typography variant="body" weight="semibold" className="mb-md text-text-primary">
            Current Status
          </Typography>

          <View className="items-center rounded-2xl border border-border bg-surface px-md py-xl">
            <View className="mb-md h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Typography variant="h1">🎯</Typography>
            </View>
            <Typography variant="body" weight="semibold" className="text-center text-text-primary">
              Waiting for tasks
            </Typography>
            <Typography
              variant="caption"
              color="secondary"
              className="mt-sm max-w-xs text-center leading-relaxed"
            >
              {isOnline
                ? 'You are online and visible to nearby customers. Task requests will appear here automatically.'
                : 'Go online to start receiving task requests from customers in your area.'}
            </Typography>

            {!isOnline && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Go Online"
                onPress={toggleOnline}
                activeOpacity={0.85}
                testID="dashboard-go-online"
                className="mt-lg flex-row items-center gap-sm rounded-full bg-primary px-xl py-md"
                style={{
                  shadowColor: '#2563EB',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <Typography variant="body" className="text-background">🟢</Typography>
                <Typography variant="body" weight="semibold" className="text-background">
                  Go Online
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Available Tasks Preview ─────────────────────────────── */}
        <View className="px-screen-padding pt-xl">
          <View className="mb-md flex-row items-center justify-between">
            <Typography variant="body" weight="semibold" className="text-text-primary">
              Available Tasks
            </Typography>
          </View>

          {tasksLoading ? (
            <View className="gap-sm">
              {[1, 2, 3].map((i) => (
                <View key={i} className="h-20 rounded-2xl border border-border bg-surface" />
              ))}
            </View>
          ) : tasksError ? (
            <View className="items-center rounded-2xl border border-border bg-surface px-lg py-xl">
              <Typography variant="body" weight="semibold" className="text-center text-text-primary">
                Failed to load tasks
              </Typography>
              <Typography variant="caption" color="secondary" className="mt-sm text-center">
                {tasksError}
              </Typography>
              <TouchableOpacity
                onPress={() => setIsOnline(true)}
                className="mt-md rounded-full bg-primary px-lg py-sm"
                activeOpacity={0.8}
              >
                <Typography variant="caption" weight="semibold" className="text-background">
                  Retry
                </Typography>
              </TouchableOpacity>
            </View>
          ) : nearbyTasks.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-md py-xl">
              <Typography variant="caption" color="secondary" className="text-center">
                {isOnline
                  ? 'No available tasks right now. Stay online to receive new requests.'
                  : 'Go online to see available tasks'}
              </Typography>
            </View>
          ) : (
            nearbyTasks.map((task) => (
              <NearbyTaskCard
                key={task.id}
                task={task}
                onPress={() => {
                  router.push(`/tasker-task-details?taskId=${task.id}`);
                }}
              />
            ))
          )}
        </View>

        <View className="h-lg" />
      </ScrollView>

      {/* ── Bottom Navigation ─────────────────────────────────────── */}
      <BottomNavBar onPress={handleNavPress} />
    </View>
  );
}
