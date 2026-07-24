import { Router } from 'express';
import healthRoutes from '../health/health.routes';
import authRoutes from '../auth/auth.routes';
import userRoutes from '../users/user.routes';
import categoryRoutes from '../categories/category.routes';
import taskRoutes from '../tasks/task.routes';
import taskStatusRoutes from '../tasks/taskStatus.routes';
import taskerRoutes from '../taskers/tasker.routes';
import taskerTasksRoutes from '../taskers/taskerTasks.routes';
import notificationRoutes from '../notifications/notification.routes';
import locationRoutes from '../location/location.routes';
import matchingRoutes from '../matching/matching.routes';
import mediaRoutes from '../media/media.routes';
import paymentRoutes from '../payment/payment.routes';
import webhookRoutes from '../payment/webhook.routes';
import walletRoutes from '../wallet/wallet.routes';

const v1Router = Router();

v1Router.use('/health', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/categories', categoryRoutes);
v1Router.use('/tasks', taskRoutes);
v1Router.use('/tasks', taskStatusRoutes);
v1Router.use('/taskers', taskerRoutes);
v1Router.use('/taskers', taskerTasksRoutes);
v1Router.use('/notifications', notificationRoutes);
v1Router.use('/location', locationRoutes);
v1Router.use('/matching', matchingRoutes);
v1Router.use('/media', mediaRoutes);
v1Router.use('/payments', paymentRoutes);
v1Router.use('/webhooks', webhookRoutes);
v1Router.use('/wallet', walletRoutes);

export { v1Router };
