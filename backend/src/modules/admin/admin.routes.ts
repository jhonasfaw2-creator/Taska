import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireAdmin } from '../../common/middleware/admin.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';
import * as ctrl from './admin.controller';

const router = Router();

// ── Admin Auth (no auth required) ───────────────────────
router.post('/auth/login', ctrl.login);

// ── All routes below require admin auth ─────────────────
router.use(requireAuth, requireAdmin);

// ── Dashboard ───────────────────────────────────────────
router.get('/dashboard/stats', requirePermission('dashboard:view'), ctrl.getDashboardStats);
router.get('/dashboard/user-growth', requirePermission('dashboard:view'), ctrl.getUserGrowth);
router.get('/dashboard/task-growth', requirePermission('dashboard:view'), ctrl.getTaskGrowth);
router.get('/dashboard/revenue-growth', requirePermission('dashboard:view'), ctrl.getRevenueGrowth);
router.get('/dashboard/category-distribution', requirePermission('dashboard:view'), ctrl.getTaskCategoryDistribution);

// ── User Management ─────────────────────────────────────
router.get('/users', requirePermission('users:view'), ctrl.listUsers);
router.get('/users/:id', requirePermission('users:view'), ctrl.getUserDetails);
router.patch('/users/:id', requirePermission('users:edit'), ctrl.updateUser);
router.post('/users/:id/suspend', requirePermission('users:suspend'), ctrl.suspendUser);
router.post('/users/:id/reactivate', requirePermission('users:suspend'), ctrl.reactivateUser);
router.delete('/users/:id', requirePermission('users:delete'), ctrl.deleteUser);

// ── Task Management ─────────────────────────────────────
router.get('/tasks', requirePermission('tasks:view'), ctrl.listTasks);
router.get('/tasks/:id', requirePermission('tasks:view'), ctrl.getTaskDetails);
router.post('/tasks/:id/cancel', requirePermission('tasks:cancel'), ctrl.cancelTask);
router.post('/tasks/:id/reassign', requirePermission('tasks:reassign'), ctrl.reassignTask);

// ── Tasker Management ───────────────────────────────────
router.get('/taskers', requirePermission('taskers:view'), ctrl.listTaskers);
router.get('/taskers/:id', requirePermission('taskers:view'), ctrl.getTaskerDetails);
router.post('/taskers/:id/approve', requirePermission('taskers:verify'), ctrl.approveTasker);
router.post('/taskers/:id/reject', requirePermission('taskers:verify'), ctrl.rejectTasker);
router.post('/taskers/:id/suspend', requirePermission('taskers:suspend'), ctrl.suspendTaskerSubmit);

// ── Payment Management ──────────────────────────────────
router.get('/payments', requirePermission('payments:view'), ctrl.listAdminPayments);
router.get('/payments/:id', requirePermission('payments:view'), ctrl.getAdminPaymentDetails);
router.post('/payments/:id/refund', requirePermission('payments:refund'), ctrl.processRefund);

// ── Wallet Management ───────────────────────────────────
router.get('/wallets', requirePermission('payments:view'), ctrl.listWallets);

// ── Notifications ───────────────────────────────────────
router.post('/notifications/send', requirePermission('notifications:send'), ctrl.sendNotification);
router.post('/notifications/broadcast', requirePermission('notifications:broadcast'), ctrl.broadcastNotification);

// ── Reports ─────────────────────────────────────────────
router.get('/reports/revenue', requirePermission('reports:view'), ctrl.getRevenueReport);
router.get('/reports/users', requirePermission('reports:view'), ctrl.getUsersReport);
router.get('/reports/tasks', requirePermission('reports:view'), ctrl.getTasksReport);
router.get('/reports/payments', requirePermission('reports:view'), ctrl.getPaymentsReport);
router.get('/reports/export', requirePermission('reports:export'), ctrl.exportReport);

// ── Audit Logs ──────────────────────────────────────────
router.get('/audit-logs', requirePermission('audit:view'), ctrl.listAuditLogs);

// ── Admin Management ────────────────────────────────────
router.get('/admins', requirePermission('admins:manage'), ctrl.listAdminUsers);
router.post('/admins', requirePermission('admins:manage'), ctrl.createAdminUser);
router.patch('/admins/:id/role', requirePermission('admins:manage'), ctrl.updateAdminRole);
router.delete('/admins/:id', requirePermission('admins:manage'), ctrl.removeAdmin);

export default router;
