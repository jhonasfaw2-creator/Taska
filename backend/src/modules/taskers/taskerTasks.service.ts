import { prisma } from '../../prisma/client';
import { AppError } from '../../common/types';
import { emitToTask } from '../../common/socket';
import { haversineDistance, validateCoordinates } from '../../modules/location/location.service';

export interface AvailableTaskResult {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  estimatedPrice: number;
  offerPrice: number;
  offerId: string;
  customerRating: number | null;
  createdAt: string;
}

export interface NearbyTaskResult {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  estimatedPrice: number;
  customerRating: number | null;
  distanceKm: number;
  status: string;
  createdAt: string;
}

export interface AcceptResult {
  message: string;
  task: {
    id: string;
    status: string;
    taskerId: string;
    title: string;
    estimatedPrice: number;
    pickupAddress: string;
    dropoffAddress: string;
  };
}

export async function getAvailableTasks(taskerProfileId: string): Promise<AvailableTaskResult[]> {
  const offers = await prisma.taskOffer.findMany({
    where: {
      taskerId: taskerProfileId,
      status: 'PENDING',
      task: { status: { in: ['PENDING', 'SEARCHING'] } },
    },
    include: {
      task: {
        include: {
          category: { select: { name: true } },
          customer: {
            include: {
              receivedReviews: {
                select: { rating: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return offers.map((offer) => {
    const reviews = offer.task.customer.receivedReviews;
    const avgRating =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

    return {
      id: offer.task.id,
      title: offer.task.title,
      description: offer.task.description,
      categoryName: offer.task.category.name,
      pickupAddress: offer.task.pickupAddress,
      pickupLatitude: Number(offer.task.pickupLatitude),
      pickupLongitude: Number(offer.task.pickupLongitude),
      dropoffAddress: offer.task.dropoffAddress,
      estimatedPrice: Number(offer.task.estimatedPrice),
      offerPrice: Number(offer.price),
      offerId: offer.id,
      customerRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      createdAt: offer.task.createdAt.toISOString(),
    };
  });
}

export async function getNearbyTasksForTasker(options: {
  taskerProfileId: string;
  radiusKm: number;
  vehicleType?: string;
  status?: string;
}): Promise<NearbyTaskResult[]> {
  const { radiusKm, vehicleType, status } = options;

  const profile = await prisma.taskerProfile.findUnique({
    where: { id: options.taskerProfileId },
    select: {
      userId: true,
      latitude: true,
      longitude: true,
      verificationStatus: true,
      isOnline: true,
    },
  });

  if (!profile || !profile.latitude || !profile.longitude) {
    return [];
  }

  validateCoordinates(profile.latitude, profile.longitude);

  const tasks = await prisma.task.findMany({
    where: {
      status: status ? (status as any) : 'SEARCHING',
      taskerId: null,
      customerId: { not: profile.userId },
      ...(vehicleType ? { vehicleType: vehicleType as any } : {}),
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          receivedReviews: {
            select: { rating: true },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const tasksWithDistance = tasks
    .map((task) => {
      const distance = haversineDistance(
        profile.latitude!,
        profile.longitude!,
        Number(task.pickupLatitude),
        Number(task.pickupLongitude),
      );
      const reviews = task.customer.receivedReviews;
      const avgRating =
        reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        categoryName: task.category.name,
        pickupAddress: task.pickupAddress,
        pickupLatitude: Number(task.pickupLatitude),
        pickupLongitude: Number(task.pickupLongitude),
        dropoffAddress: task.dropoffAddress,
        estimatedPrice: Number(task.estimatedPrice),
        customerRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        distanceKm: Math.round(distance * 10) / 10,
        status: task.status,
        createdAt: task.createdAt.toISOString(),
      };
    })
    .filter((task) => task.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return tasksWithDistance;
}

export async function updateTaskerLocation(
  taskerProfileId: string,
  latitude: number,
  longitude: number,
) {
  validateCoordinates(latitude, longitude);
  return prisma.taskerProfile.update({
    where: { id: taskerProfileId },
    data: {
      latitude,
      longitude,
      lastLocationUpdate: new Date(),
      isOnline: true,
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      lastLocationUpdate: true,
      isOnline: true,
    },
  });
}

export async function acceptTask(taskerProfileId: string, taskId: string): Promise<AcceptResult> {
  const offer = await prisma.taskOffer.findFirst({
    where: {
      taskId,
      taskerId: taskerProfileId,
      status: 'PENDING',
    },
    include: {
      task: {
        select: { status: true, taskerId: true },
      },
    },
  });

  if (!offer) {
    throw new AppError(
      'No pending offer found for this task. You may not have been offered this task.',
      404,
    );
  }

  if (offer.task.status === 'ACCEPTED' || offer.task.taskerId !== null) {
    throw new AppError('This task has already been accepted by another tasker.', 409);
  }

  if (offer.task.status !== 'PENDING' && offer.task.status !== 'SEARCHING') {
    throw new AppError(`Cannot accept a task with status "${offer.task.status}".`, 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status: 'ACCEPTED',
        taskerId: taskerProfileId,
      },
    });

    await tx.taskOffer.updateMany({
      where: {
        taskId,
        status: 'PENDING',
        NOT: { taskerId: taskerProfileId },
      },
      data: { status: 'REJECTED' },
    });

    await tx.taskOffer.update({
      where: { id: offer.id },
      data: { status: 'ACCEPTED' },
    });

    await tx.taskStatusHistory.create({
      data: {
        taskId,
        status: 'ACCEPTED',
        changedBy: taskerProfileId,
      },
    });

    return updatedTask;
  });

  try {
    emitToTask(taskId, {
      event: 'task_accepted',
      taskId,
      taskerId: taskerProfileId,
      taskerName: '',
    });

    emitToTask(taskId, {
      event: 'task_status_changed',
      taskId,
      status: 'ACCEPTED',
      previousStatus: result.status,
      changedBy: taskerProfileId,
    });
  } catch (err) {
    console.error('[Socket] Failed to emit task_accepted:', err);
  }

  return {
    message: 'Task accepted successfully',
    task: {
      id: result.id,
      status: result.status,
      taskerId: result.taskerId ?? taskerProfileId,
      title: result.title,
      estimatedPrice: Number(result.estimatedPrice),
      pickupAddress: result.pickupAddress,
      dropoffAddress: result.dropoffAddress,
    },
  };
}
