import { prisma } from '../../prisma/client';
import { AppError } from '../../common/types';
import { emitToTask } from '../../common/socket';

// ─── Status Transition Map ─────────────────────────────
// Defines all valid transitions and who is allowed to perform them.
// Key: current status, Value: { nextStatus: allowedRoles[] }

const VALID_TRANSITIONS: Record<string, Record<string, string[]>> = {
  PENDING: {
    SEARCHING: ['CUSTOMER'], // Task posted → searching for taskers
    CANCELLED: ['CUSTOMER'], // Customer cancels before assignment
  },
  SEARCHING: {
    CANCELLED: ['CUSTOMER'], // Customer cancels while searching
  },
  ACCEPTED: {
    PICKED_UP: ['TASKER'], // Tasker marks item picked up
  },
  PICKED_UP: {
    IN_PROGRESS: ['TASKER'], // Tasker marks en route to destination
  },
  IN_PROGRESS: {
    COMPLETED: ['TASKER'], // Tasker marks task complete
  },
};

// Terminal states — no transitions allowed out of these
const TERMINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED']);

// ─── Public API ────────────────────────────────────────

export interface StatusUpdateResult {
  id: string;
  status: string;
  previousStatus: string;
  message: string;
}

/**
 * Validate and apply a task status transition.
 *
 * Rules:
 * 1. The transition must be defined in VALID_TRANSITIONS.
 * 2. The requesting user's role must be authorised for the transition.
 * 3. After acceptance, only the assigned tasker can update progress.
 * 4. Every change is recorded in TaskStatusHistory.
 *
 * @param taskId       - The task to update.
 * @param newStatus    - The target status.
 * @param userId       - User ID from JWT.
 * @param userRole     - User role (CUSTOMER or TASKER).
 */
export async function updateTaskStatus(
  taskId: string,
  newStatus: string,
  userId: string,
  userRole: string,
): Promise<StatusUpdateResult> {
  // ── Fetch the task ──────────────────────────────────
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  const currentStatus = task.status;

  // ── Terminal status check ───────────────────────────
  if (TERMINAL_STATUSES.has(currentStatus)) {
    throw new AppError(
      `Cannot update a task with status "${currentStatus}". The task is already in a terminal state.`,
      400,
    );
  }

  // ── Prevent no-op ───────────────────────────────────
  if (currentStatus === newStatus) {
    throw new AppError(`Task is already in "${newStatus}" status.`, 400);
  }

  // ── Validate transition exists ──────────────────────
  const allowedRoles = VALID_TRANSITIONS[currentStatus]?.[newStatus];
  if (!allowedRoles) {
    throw new AppError(`Invalid status transition: "${currentStatus}" → "${newStatus}".`, 400);
  }

  // ── Role authorisation ──────────────────────────────
  if (!allowedRoles.includes(userRole)) {
    throw new AppError(
      `Your role (${userRole}) is not allowed to change status from "${currentStatus}" to "${newStatus}".`,
      403,
    );
  }

  // ── Post-acceptance: only assigned tasker can update ──
  if (['ACCEPTED', 'PICKED_UP', 'IN_PROGRESS'].includes(currentStatus)) {
    // For TASKER role, verify they are the assigned tasker
    if (userRole === 'TASKER') {
      const profile = await prisma.taskerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!profile || task.taskerId !== profile.id) {
        throw new AppError('Only the assigned tasker can update the task progress.', 403);
      }
    }
  }

  // ── For customer cancellation, verify ownership ─────
  if (userRole === 'CUSTOMER' && newStatus === 'CANCELLED') {
    if (task.customerId !== userId) {
      throw new AppError('You can only cancel your own tasks.', 403);
    }
  }

  // ── Apply the transition ────────────────────────────
  const result = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status: newStatus as any,
        ...(newStatus === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });

    await tx.taskStatusHistory.create({
      data: {
        taskId,
        status: newStatus as any,
        changedBy: userId,
      },
    });

    return updatedTask;
  });

  // ── Emit real-time events ────────────────────────────
  try {
    // Emit to everyone in the task room
    emitToTask(taskId, {
      event: 'task_status_changed',
      taskId,
      status: newStatus,
      previousStatus: currentStatus,
      changedBy: userId,
    });

    // If cancelled, emit cancellation event
    if (newStatus === 'CANCELLED') {
      emitToTask(taskId, {
        event: 'task_cancelled',
        taskId,
      });
    }
  } catch (err) {
    // Socket emission is best-effort; don't fail the request
    console.error('[Socket] Failed to emit status change:', err);
  }

  return {
    id: result.id,
    status: result.status,
    previousStatus: currentStatus,
    message: `Task status updated from "${currentStatus}" to "${newStatus}".`,
  };
}

/**
 * Get the full status history for a task.
 */
export async function getTaskStatusHistory(
  taskId: string,
): Promise<Array<{ status: string; changedBy: string; createdAt: string }>> {
  const history = await prisma.taskStatusHistory.findMany({
    where: { taskId },
    orderBy: { createdAt: 'asc' },
  });

  return history.map((h) => ({
    status: h.status,
    changedBy: h.changedBy,
    createdAt: h.createdAt.toISOString(),
  }));
}
