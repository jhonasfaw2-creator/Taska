import { prisma } from '../../prisma/client';
import { AppError } from '../../common/types';
import { logger } from '../../common/utils/logger';
import { emitToUser } from '../../common/socket';
import type { NotificationType } from '@prisma/client';

export interface NotificationResult {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function mapNotification(n: any): NotificationResult {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function registerDevice(
  userId: string,
  pushToken: string,
  platform: string,
): Promise<{ message: string }> {
  const existing = await prisma.userDevice.findFirst({
    where: { pushToken },
  });

  if (existing) {
    const data = {
      userId,
      platform,
      isActive: true,
      lastUsedAt: new Date(),
    };
    await prisma.userDevice.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.userDevice.create({
      data: { userId, pushToken, platform },
    });
  }

  return { message: 'Device registered successfully' };
}

export async function getNotifications(userId: string): Promise<NotificationResult[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return notifications.map(mapNotification);
}

export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<NotificationResult> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new AppError('Notification not found.', 404);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return mapNotification(updated);
}

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
): Promise<void> {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: type as NotificationType,
    },
  });

  // Emit real-time notification event to the user's personal room
  try {
    emitToUser(userId, {
      event: 'notification_created',
      userId,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
      },
    });
  } catch (err) {
    logger.error(err as Error, 'Socket emit failed: notification');
  }

  const devices = await prisma.userDevice.findMany({
    where: { userId, isActive: true },
    select: { pushToken: true, platform: true },
  });

  if (devices.length === 0) {
    return;
  }

  const messages = devices.map((d) => ({
    to: d.pushToken,
    sound: 'default' as const,
    title,
    body: message,
    data: { type, notificationId: notification.id },
  }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error({ status: response.status, body: text }, 'Expo push API error');
    }
  } catch (err) {
    logger.error(err as Error, 'Failed to send push notification');
  }
}
