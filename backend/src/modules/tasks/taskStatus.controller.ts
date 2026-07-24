import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError } from '../../common/types';
import * as taskStatusService from './taskStatus.service';

/**
 * PATCH /api/v1/tasks/:taskId/status
 *
 * Request:  { "status": "SEARCHING" | "CANCELLED" | "PICKED_UP" | "IN_PROGRESS" | "COMPLETED" }
 * Response: { "id": "...", "status": "...", "previousStatus": "...", "message": "..." }
 *
 * Authentication required. Role-based permission enforced in service.
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const taskId = req.params.taskId as string | undefined;
  if (!taskId || !/^[0-9a-f-]{36}$/i.test(taskId)) {
    throw new AppError('Valid Task ID is required.', 400);
  }

  const { status: newStatus } = req.body;
  if (!newStatus || typeof newStatus !== 'string') {
    throw new AppError('Status is required and must be a string.', 400);
  }

  // Normalise to uppercase
  const normalizedStatus = newStatus.toUpperCase();
  const validStatuses = ['SEARCHING', 'CANCELLED', 'PICKED_UP', 'IN_PROGRESS', 'COMPLETED'];
  if (!validStatuses.includes(normalizedStatus)) {
    throw new AppError(
      `Invalid status "${newStatus}". Must be one of: ${validStatuses.join(', ')}.`,
      400,
    );
  }

  const result = await taskStatusService.updateTaskStatus(
    taskId,
    normalizedStatus,
    req.user.userId,
    req.user.role,
  );

  res.status(200).json(result);
});

/**
 * GET /api/v1/tasks/:taskId/status-history
 *
 * Returns the full ordered list of status changes for a task.
 */
export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const taskId = req.params.taskId as string | undefined;
  if (!taskId) {
    throw new AppError('Task ID is required.', 400);
  }

  const history = await taskStatusService.getTaskStatusHistory(taskId);

  res.status(200).json(history);
});
