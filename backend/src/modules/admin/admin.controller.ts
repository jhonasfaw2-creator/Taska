import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import * as adminService from './admin.service';
import { createAuditLog, getAuditLogs } from './audit.service';
import {
  createAdminSchema, updateAdminRoleSchema, sendNotificationSchema, broadcastSchema,
  targetedNotificationSchema,
  userSearchSchema, taskFilterSchema, taskerFilterSchema, paymentFilterSchema,
  updateUserSchema, refundInputSchema, resolveDisputeSchema, payoutSchema,
  reportQuerySchema, growthQuerySchema, paginationSchema,
} from './admin.validation';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

function escapeCSV(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getClientInfo(req: Request) {
  return { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ error: 'Phone number and password are required.' });
    }
    const result = await adminService.loginAdmin(phoneNumber, password, req.ip);
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
    res.json({ success: true, data: { message: 'User deleted.' } });
  } catch (err) { next(err); }
}

export async function resetUserVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.resetUserVerification(req.params.id, req.user!.userId, req.ip);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function resetUserAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.resetUserAccount(req.params.id, req.user!.userId, req.ip);
    res.json({ success: true, data: result });
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

export async function resolveDispute(req: Request, res: Response, next: NextFunction) {
  try {
    const data = resolveDisputeSchema.parse(req.body);
    const result = await adminService.resolveDispute(
      req.params.id, data.resolution, data.action, req.user!.userId, req.ip,
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function listWallets(req: Request, res: Response, next: NextFunction) {
  try {
    const params = paginationSchema.parse(req.query);
    const result = await adminService.listAllWallets(params);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function approvePayout(req: Request, res: Response, next: NextFunction) {
  try {
    const data = payoutSchema.parse(req.body);
    const result = await adminService.approvePayout(data.walletId, data.amount, req.user!.userId, req.ip);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getWalletTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const params = paginationSchema.parse(req.query);
    const { walletId } = req.params;
    const result = await adminService.getWalletTransactions(walletId, params);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function sendTargetedNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const data = targetedNotificationSchema.parse(req.body);
    const result = await adminService.sendTargetedNotification(data.userIds, data.title, data.message);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit = '50', offset = '0' } = req.query;
    const result = await adminService.listNotifications(Number(limit), Number(offset));
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
    const { dateFrom, dateTo } = reportQuerySchema.parse(req.query);
    const report = await adminService.getUsersReport(dateFrom, dateTo);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function getTasksReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { dateFrom, dateTo } = reportQuerySchema.parse(req.query);
    const report = await adminService.getTasksReport(dateFrom, dateTo);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function getPaymentsReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { dateFrom, dateTo } = reportQuerySchema.parse(req.query);
    const report = await adminService.getPaymentsReport(dateFrom, dateTo);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function exportReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, format = 'csv', dateFrom, dateTo, days } = req.query as any;
    let data: any;
    switch (type) {
      case 'revenue': data = await adminService.getRevenueReport(dateFrom, dateTo); break;
      case 'users': data = await adminService.getUsersReport(dateFrom, dateTo); break;
      case 'tasks': data = await adminService.getTasksReport(dateFrom, dateTo); break;
      case 'payments': data = await adminService.getPaymentsReport(dateFrom, dateTo); break;
      case 'growth': {
        const d = Number(days) || 30;
        const [userGrowth, taskGrowth, revenueGrowth] = await Promise.all([
          adminService.getUserGrowth(d),
          adminService.getTaskGrowth(d),
          adminService.getRevenueGrowth(d),
        ]);
        data = {
          data: userGrowth.map((u: any, i: number) => ({
            date: u.date,
            newUsers: u.value,
            newTasks: taskGrowth[i]?.value ?? 0,
            revenue: revenueGrowth[i]?.value ?? 0,
          })),
          totalNewUsers: userGrowth.reduce((s: number, p: any) => s + p.value, 0),
          totalNewTasks: taskGrowth.reduce((s: number, p: any) => s + p.value, 0),
          totalRevenue: revenueGrowth.reduce((s: number, p: any) => s + p.value, 0),
          days: d,
        };
        break;
      }
      default: return res.status(400).json({ error: 'Invalid report type.' });
    }

    const fmt = (format as string).toLowerCase();
    const filename = `${type}-report-${Date.now()}`;

    if (fmt === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      const fields = Object.keys(data).filter((k) => k !== 'data');
      let csv = fields.map(escapeCSV).join(',') + '\n';
      csv += fields.map((f) => escapeCSV(data[f])).join(',') + '\n\n';
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const keys = Object.keys(data.data[0]);
        csv += keys.map(escapeCSV).join(',') + '\n';
        for (const row of data.data) {
          csv += keys.map((k) => escapeCSV(row[k])).join(',') + '\n';
        }
      } else if (data.byStatus) {
        csv += 'status,count\n';
        for (const [status, count] of Object.entries(data.byStatus)) {
          csv += `${escapeCSV(status)},${count}\n`;
        }
      }
      return res.send(csv);
    }

    if (fmt === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Taska Admin';
      const sheet = workbook.addWorksheet(type.charAt(0).toUpperCase() + type.slice(1));

      // Summary section
      sheet.addRow([`${type.charAt(0).toUpperCase() + type.slice(1)} Report`]);
      sheet.addRow([]);
      const summaryFields = Object.keys(data).filter((k) => k !== 'data' && k !== 'byStatus');
      for (const field of summaryFields) {
        sheet.addRow([field, data[field] ?? '']);
      }
      sheet.addRow([]);

      // Data section
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const keys = Object.keys(data.data[0]);
        sheet.columns = keys.map((k) => ({
          header: k.charAt(0).toUpperCase() + k.slice(1),
          key: k,
          width: 20,
        }));
        for (const row of data.data) {
          sheet.addRow(keys.map((k) => row[k] ?? ''));
        }
      } else if (data.byStatus) {
        sheet.addRow(['Status', 'Count']);
        for (const [status, count] of Object.entries(data.byStatus)) {
          sheet.addRow([status, count]);
        }
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (fmt === 'pdf') {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      doc.pipe(res);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Taska Admin Report', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, { align: 'center' });
      doc.moveDown();

      // Date range
      if (dateFrom || dateTo) {
        doc.fontSize(10).text(`Period: ${dateFrom || 'Start'} → ${dateTo || 'Today'}`);
        doc.moveDown();
      }

      // Summary
      doc.fontSize(12).font('Helvetica-Bold').text('Summary', { underline: true });
      doc.moveDown(0.5);
      const summaryFields = Object.keys(data).filter((k) => k !== 'data' && k !== 'byStatus' && k !== 'count');
      for (const field of summaryFields) {
        doc.fontSize(10).font('Helvetica').text(`  ${field}: ${data[field] ?? ''}`);
      }
      doc.moveDown();

      // Data table
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Details', { underline: true });
        doc.moveDown(0.5);

        const keys = Object.keys(data.data[0]);
        const startX = 50;
        const colWidth = Math.min(80, (500) / keys.length);
        let y = doc.y;

        // Header row
        doc.fontSize(9).font('Helvetica-Bold');
        keys.forEach((k, i) => {
          doc.text(k.charAt(0).toUpperCase() + k.slice(1), startX + i * colWidth, y, { width: colWidth });
        });
        y += 15;
        doc.moveTo(startX, y - 5).lineTo(startX + keys.length * colWidth, y - 5).stroke();

        // Data rows
        doc.fontSize(8).font('Helvetica');
        for (const row of data.data) {
          if (y > 750) { doc.addPage(); y = 50; }
          keys.forEach((k, i) => {
            doc.text(String(row[k] ?? ''), startX + i * colWidth, y, { width: colWidth });
          });
          y += 12;
        }
      } else if (data.byStatus) {
        doc.fontSize(12).font('Helvetica-Bold').text('Status Breakdown', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        for (const [status, count] of Object.entries(data.byStatus)) {
          doc.text(`  ${status}: ${count}`);
        }
      }

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        `Generated on ${new Date().toLocaleString()} by Taska Admin`,
        50, doc.page.height - 50, { align: 'center' }
      );

      doc.end();
      return;
    }

    return res.status(400).json({ error: 'Unsupported format. Use csv, xlsx, or pdf.' });
  } catch (err) { next(err); }
}

export async function getGrowthReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { days } = growthQuerySchema.parse(req.query);
    const [userGrowth, taskGrowth, revenueGrowth] = await Promise.all([
      adminService.getUserGrowth(days),
      adminService.getTaskGrowth(days),
      adminService.getRevenueGrowth(days),
    ]);
    res.json({
      success: true,
      data: {
        days,
        userGrowth,
        taskGrowth,
        revenueGrowth,
        summary: {
          totalNewUsers: userGrowth.reduce((s: number, p: any) => s + p.value, 0),
          totalNewTasks: taskGrowth.reduce((s: number, p: any) => s + p.value, 0),
          totalRevenue: revenueGrowth.reduce((s: number, p: any) => s + p.value, 0),
          avgDailyUsers: Math.round(userGrowth.reduce((s: number, p: any) => s + p.value, 0) / days),
          avgDailyTasks: Math.round(taskGrowth.reduce((s: number, p: any) => s + p.value, 0) / days),
          avgDailyRevenue: revenueGrowth.reduce((s: number, p: any) => s + p.value, 0) / days,
        },
      },
    });
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
