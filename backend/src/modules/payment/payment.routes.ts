import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireAdmin } from '../../common/middleware/admin.middleware';
import {
  createPayment,
  confirmPayment,
  cancelPayment,
  getPayment,
  getPaymentByTask,
  listPayments,
  refundPayment,
  getPaymentAuditLogs,
  listAllPayments,
} from './payment.controller';

const router = Router();

router.use(requireAuth);

// ── Customer / tasker routes ─────────────────────────
router.post('/', createPayment);
router.post('/:id/confirm', confirmPayment);
router.post('/:id/cancel', cancelPayment);
router.post('/:id/refund', refundPayment);
router.get('/:id', getPayment);
router.get('/:id/audit-logs', getPaymentAuditLogs);
router.get('/task/:taskId', getPaymentByTask);
router.get('/', listPayments);

// ── Admin routes ─────────────────────────────────────
router.get('/admin/all', requireAdmin, listAllPayments);

export default router;
