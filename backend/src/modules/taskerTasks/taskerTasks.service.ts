import { prisma } from '../../prisma/client';
import { AppError } from '../../types';

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

export async function getAvailableTasks(
  taskerProfileId: string,
): Promise<AvailableTaskResult[]> {
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
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

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

export async function acceptTask(
  taskerProfileId: string,
  taskId: string,
): Promise<AcceptResult> {
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
    throw new AppError(
      'This task has already been accepted by another tasker.',
      409,
    );
  }

  if (
    offer.task.status !== 'PENDING' &&
    offer.task.status !== 'SEARCHING'
  ) {
    throw new AppError(
      `Cannot accept a task with status "${offer.task.status}".`,
      400,
    );
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
