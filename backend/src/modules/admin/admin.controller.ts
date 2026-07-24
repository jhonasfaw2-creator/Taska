import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import * as adminService from './admin.service';
import { createAuditLog, getAuditLogs } from './audit.service';
import {
  createAdminSchema, updateAdminRoleSchema, sendNotificationSchema, broadcastSchema,
  userSearchSchema, taskFilterSchema, taskerFilterSchema, paymentFilterSchema,
  updateUserSchema, refundInputSchema,
  reportQuerySchema, paginationSchema,
} from './admin.validation';

function getClientInfo(req: Request) {
  return { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ error: 'Phone number and password are required.' });
    }
    const result = await adminService.loginAdmin(phoneNumber, password);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}

export async function getUserGrowth(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getUserGrowth(Number(req.query.days) || 30);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getTaskGrowth(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getTaskGrowth(Number(req.query.days) || 30);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getRevenueGrowth(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getRevenueGrowth(Number(req.query.days) || 30);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getTaskCategoryDistribution(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getTaskCategoryDistribution();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const params = userSearchSchema.parse(req.query);
    const result = await adminService.listUsers(params);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getUserDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.getUserDetails(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateUserSchema.parse(req.body);
    const updated = await adminService.updateUser(req.params.id, data);
    await createAuditLog({ adminId: req.user?.userId, action: 'update_user', entityType: 'user', entityId: req.params.id, changes: data, ...getClientInfo(req) });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

export async function suspendUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.suspendUser(req.params.id, req.user!.userId, req.ip);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function reactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.reactivateUser(req.params.id, req.user!.userId, req.ip);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.deleteUser(req.params.id, req.user!.userId, req.ip);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const params = taskFilterSchema.parse(req.query);
    const result = await adminService.listTasks(params);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getTaskDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await adminService.getTaskDetails(req.params.id);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
}

export async function cancelTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = req.body;
    const task = await adminService.cancelTask(req.params.id, reason || 'Cancelled by admin', req.user!.userId, req.ip);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
}

export async function reassignTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskerId } = req.body;
    if (!taskerId) return res.status(400).json({ error: 'taskerId is required.' });
    const task = await adminService.reassignTask(req.params.id, taskerId, req.user!.userId, req.ip);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
}

export async function listTaskers(req: Request, res: Response, next: NextFunction) {
  try {
    const params = taskerFilterSchema.parse(req.query);
    const result = await adminService.listTaskers(params);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getTaskerDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const tasker = await adminService.getTaskerDetails(req.params.id);
    res.json({ success: true, data: tasker });
  } catch (err) { next(err); }
}

export async function approveTasker(req: Request, res: Response, next: NextFunction) {
  try {
    const tasker = await adminService.approveTasker(req.params.id, req.user!.userId, req.ip);
    res.json({ success: true, data: tasker });
  } catch (err) { next(err); }
}

export async function rejectTasker(req: Request, res: Response, next: NextFunction) {
  try {
    const tasker = await adminService.rejectTasker(req.params.id, req.user!.userId, req.ip);
    res.json({ success: true, data: tasker });
  } catch (err) { next(err); }
}

export async function suspendTaskerSubmit(req: Request, res: Response, next: NextFunction) {
  try {
    const tasker = await adminService.suspendTasker(req.params.id, req.user!.userId, req.ip);
    res.json({ success: true, data: tasker });
  } catch (err) { next(err); }
}

export async function listAdminPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const params = paymentFilterSchema.parse(req.query);
    const result = await adminService.listAllPayments(params);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getAdminPaymentDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await adminService.getPaymentDetails(req.params.id);
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
}

export async function processRefund(req: Request, res: Response, next: NextFunction) {
  try {
    const data = refundInputSchema.parse(req.body);
    const payment = await adminService.getPaymentDetails(req.params.id);
    if (!['PAID', 'PARTIALLY_REFUNDED'].includes(payment.paymentStatus)) {
      return res.status(400).json({ error: 'Payment cannot be refunded.' });
    }
    const refund = await prisma.paymentRefund.create({
      data: { paymentId: req.params.id, amount: data.amount, reason: data.reason, reasonDetail: data.reasonDetail, processedById: req.user!.userId },
    });
    await createAuditLog({ adminId: req.user?.userId, action: 'process_refund', entityType: 'payment', entityId: req.params.id, ...getClientInfo(req) });
    res.json({ success: true, data: refund });
  } catch (err) { next(err); }
}

export async function listWallets(req: Request, res: Response, next: NextFunction) {
  try {
    const params = paginationSchema.parse(req.query);
    const result = await adminService.listAllWallets(params);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function sendNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const data = sendNotificationSchema.parse(req.body);
    const notification = await adminService.sendNotification(data.userId, data.title, data.message);
    await createAuditLog({ adminId: req.user?.userId, action: 'send_notification', entityType: 'notification', entityId: notification.id, ...getClientInfo(req) });
    res.json({ success: true, data: notification });
  } catch (err) { next(err); }
}

export async function broadcastNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const data = broadcastSchema.parse(req.body);
    const result = await adminService.broadcastNotification(data.title, data.message, data.roleFilter);
    await createAuditLog({ adminId: req.user?.userId, action: 'broadcast_notification', entityType: 'notification', entityId: 'broadcast', changes: data, ...getClientInfo(req) });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getRevenueReport(req: Request, res: Response, next: NextFunction) {
  try {
    const params = reportQuerySchema.parse(req.query);
    const report = await adminService.getRevenueReport(params.dateFrom, params.dateTo, params.groupBy);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function getUsersReport(req: Request, res: Response, next: NextFunction) {
  try {
    const report = await adminService.getUsersReport(req.query.dateFrom as string, req.query.dateTo as string);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function getTasksReport(req: Request, res: Response, next: NextFunction) {
  try {
    const report = await adminService.getTasksReport(req.query.dateFrom as string, req.query.dateTo as string);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function getPaymentsReport(req: Request, res: Response, next: NextFunction) {
  try {
    const report = await adminService.getPaymentsReport(req.query.dateFrom as string, req.query.dateTo as string);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function exportReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, format = 'csv', dateFrom, dateTo } = req.query as any;
    let data: any;
    switch (type) {
      case 'revenue': data = await adminService.getRevenueReport(dateFrom, dateTo); break;
      case 'users': data = await adminService.getUsersReport(dateFrom, dateTo); break;
      case 'tasks': data = await adminService.getTasksReport(dateFrom, dateTo); break;
      case 'payments': data = await adminService.getPaymentsReport(dateFrom, dateTo); break;
      default: return res.status(400).json({ error: 'Invalid report type.' });
    }
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
      let csv = 'date,value\n';
      if (data.data) {
        for (const row of data.data) csv += `${row.date},${row.revenue || row.value || 0}\n`;
      }
      res.send(csv);
    } else {
      res.json({ success: true, data });
    }
  } catch (err) { next(err); }
}

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const params = paginationSchema.parse(req.query);
    const result = await getAuditLogs({
      ...params,
      entityType: req.query.entityType as string,
      entityId: req.query.entityId as string,
      action: req.query.action as string,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function listAdminUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const admins = await adminService.listAdminUsers();
    res.json({ success: true, data: admins });
  } catch (err) { next(err); }
}

export async function createAdminUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createAdminSchema.parse(req.body);
    const admin = await adminService.createAdminUser(data.userId, data.role);
    await createAuditLog({ adminId: req.user?.userId, action: 'create_admin', entityType: 'admin', entityId: admin.id, ...getClientInfo(req) });
    res.status(201).json({ success: true, data: admin });
  } catch (err) { next(err); }
}

export async function updateAdminRole(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateAdminRoleSchema.parse(req.body);
    const admin = await adminService.updateAdminRole(req.params.id, data.role);
    await createAuditLog({ adminId: req.user?.userId, action: 'update_admin_role', entityType: 'admin', entityId: req.params.id, changes: data, ...getClientInfo(req) });
    res.json({ success: true, data: admin });
  } catch (err) { next(err); }
}

export async function removeAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.removeAdmin(req.params.id);
    await createAuditLog({ adminId: req.user?.userId, action: 'remove_admin', entityType: 'admin', entityId: req.params.id, ...getClientInfo(req) });
    res.json({ success: true, message: 'Admin removed.' });
  } catch (err) { next(err); }
}
