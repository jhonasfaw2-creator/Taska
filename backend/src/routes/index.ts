import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import taskRoutes from './task.routes';
import taskerRoutes from '../modules/taskers/tasker.routes';
import taskerTasksRoutes from '../modules/taskerTasks/taskerTasks.routes';
import taskStatusRoutes from '../modules/tasks/taskStatus.routes';
import notificationRoutes from '../modules/notifications/notification.routes';

/**
 * /api/v1 route group.
 *
 * Mounted at `/api/v1` in `app.ts`. Add new route modules below
 * and they will automatically be prefixed with `/api/v1`.
 */
const v1Router = Router();

// ─── Health ─────────────────────────────────────────────
v1Router.use('/health', healthRoutes);

// ─── Authentication ────────────────────────────────────
v1Router.use('/auth', authRoutes);

// ─── Users ─────────────────────────────────────────────
v1Router.use('/users', userRoutes);

// ─── Categories ────────────────────────────────────────
v1Router.use('/categories', categoryRoutes);

// ─── Tasks ─────────────────────────────────────────────
v1Router.use('/tasks', taskRoutes);
v1Router.use('/tasks', taskStatusRoutes);

// ─── Taskers ────────────────────────────────────────────
v1Router.use('/taskers', taskerRoutes);
v1Router.use('/taskers', taskerTasksRoutes);

// ─── Notifications ──────────────────────────────────────
v1Router.use('/notifications', notificationRoutes);

export { v1Router };
export default v1Router;
