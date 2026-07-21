import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from '../config/api';
import type { AppNotification } from '../types/notification';

let lastUnreadCount = 0;
let onUnreadCountChange: ((count: number) => void) | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function setUnreadCountListener(fn: (count: number) => void): void {
  onUnreadCountChange = fn;
  fn(lastUnreadCount);
}

function updateUnreadCount(delta: number) {
  lastUnreadCount = Math.max(0, lastUnreadCount + delta);
  onUnreadCountChange?.(lastUnreadCount);
}

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission not granted');
    return false;
  }

  return true;
}

export async function getPushToken(): Promise<string | null> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (err) {
    console.log('[Notifications] Failed to get push token:', err);
    return null;
  }
}

export async function registerDeviceToken(
  pushToken: string,
  platform: string,
): Promise<void> {
  try {
    await api.post('/notifications/register-device', { pushToken, platform });
  } catch (err) {
    console.log('[Notifications] Failed to register device token:', err);
  }
}

export async function initializeNotifications(): Promise<void> {
  const granted = await requestPermissions();
  if (!granted) return;

  const token = await getPushToken();
  if (!token) return;

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  await registerDeviceToken(token, platform);

  Notifications.addNotificationReceivedListener(() => {
    updateUnreadCount(1);
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as Record<string, unknown> | undefined;
    const type = data?.type as string | undefined;
    const notificationId = data?.notificationId as string | undefined;

    if (type) {
      console.log('[Notifications] Tapped notification type:', type, 'id:', notificationId);
    }
  });
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const response = await api.get<AppNotification[]>('/notifications');
  const notifications = response.data;

  const unread = notifications.filter((n) => !n.isRead).length;
  lastUnreadCount = unread;
  onUnreadCountChange?.(unread);

  return notifications;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`);
  updateUnreadCount(-1);
}
