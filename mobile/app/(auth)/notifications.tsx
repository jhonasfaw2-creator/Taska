import { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import {
  fetchNotifications,
  markNotificationRead,
} from '@/services/notification.service';
import { onSocketEvent } from '@/services/socket.service';
import type { AppNotification } from '@/types/notification';

const TYPE_CONFIG: Record<
  string,
  { icon: string; bg: string }
> = {
  TASK_REQUEST: { icon: '📋', bg: 'bg-blue-100' },
  TASK_UPDATE: { icon: '🔄', bg: 'bg-purple-100' },
  PAYMENT: { icon: '💰', bg: 'bg-green-100' },
  SYSTEM: { icon: '🔔', bg: 'bg-primary/10' },
};

function NotificationCard({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.SYSTEM;
  const timeAgo = formatTimeAgo(notification.createdAt);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}: ${notification.message}`}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`notification-${notification.id}`}
      className={[
        'mb-sm overflow-hidden rounded-2xl border bg-surface p-lg',
        notification.isRead ? 'border-border' : 'border-primary/30',
      ].join(' ')}
    >
      <View className="flex-row items-start">
        <View
          className={[
            'mr-md h-10 w-10 items-center justify-center rounded-full',
            config.bg,
          ].join(' ')}
        >
          <Typography variant="body">{config.icon}</Typography>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-sm">
            {!notification.isRead && (
              <View className="h-2 w-2 rounded-full bg-primary" />
            )}
            <Typography
              variant="body"
              weight="semibold"
              className="flex-1 text-text-primary"
              numberOfLines={1}
            >
              {notification.title}
            </Typography>
          </View>
          <Typography
            variant="caption"
            color="secondary"
            className="mt-1 leading-relaxed"
            numberOfLines={2}
          >
            {notification.message}
          </Typography>
          <Typography
            variant="caption"
            className="mt-2 text-text-secondary/60"
            style={{ fontSize: 11 }}
          >
            {timeAgo}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatTimeAgo(iso: string): string {
  const now = Date.now();
  const date = new Date(iso).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.log('[Notifications] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Listen for real-time notifications
    const unsub = onSocketEvent('notification_created', (data: any) => {
      if (data.notification) {
        setNotifications((prev) => [
          {
            id: data.notification.id,
            title: data.notification.title,
            message: data.notification.message,
            type: data.notification.type,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });

    return () => {
      unsub();
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handlePress = useCallback(
    async (notification: AppNotification) => {
      if (!notification.isRead) {
        try {
          await markNotificationRead(notification.id);
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, isRead: true } : n,
            ),
          );
        } catch (err) {
          console.log('[Notifications] Failed to mark as read:', err);
        }
      }
    },
    [],
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
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
            tintColor="#4F46E5"
            colors={['#4F46E5']}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-screen-padding pt-lg">
          <View className="flex-1">
            <Typography variant="h2" weight="bold" className="text-text-primary">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="caption" color="secondary" className="mt-xs">
                {unreadCount} unread
              </Typography>
            )}
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            testID="notifications-back"
            className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-60"
            hitSlop={8}
          >
            <Typography variant="body" className="text-text-primary">
              ✕
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-screen-padding pt-xl">
          {loading ? (
            <View className="gap-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <View
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-surface"
                />
              ))}
            </View>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon="🔔"
              title="No notifications yet"
              subtitle="When you receive task updates, payment alerts, or system messages, they will appear here."
            />
          ) : (
            notifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onPress={() => handlePress(n)}
              />
            ))
          )}
        </View>

        <View className="h-lg" />
      </ScrollView>
    </View>
  );
}
