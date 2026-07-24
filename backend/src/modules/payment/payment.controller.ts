import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { PaymentService } from './payment.service';
import { StripePaymentProvider } from './providers';
import { WalletService } from '../wallet/wallet.service';

let _paymentService: PaymentService | null = null;

function getPaymentService(): PaymentService {
  if (!_paymentService) {
    const walletService = new WalletService();
    const provider = new StripePaymentProvider();
    _paymentService = new PaymentService(provider, walletService);
  }
  return _paymentService;
}

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { taskId, amount, currency, description, idempotencyKey, metadata } = req.body;

  const result = await getPaymentService().createPayment({
    taskId,
    customerId: req.user!.userId,
    amount,
    currency,
    description,
    idempotencyKey,
    metadata,
  });

  res.status(201).json({ success: true, data: result });
});

export const confirmPayment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await getPaymentService().confirmPayment(id);
  res.json({ success: true, data: result });
});

export const cancelPayment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await getPaymentService().cancelPayment(id, req.user!.userId);
  res.json({ success: true, data: result });
});

export const getPayment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payment = await getPaymentService().getPaymentById(id);
  if (!payment) {
    res.status(404).json({ success: false, error: 'Payment not found.' });
    return;
  }
  res.json({ success: true, data: payment });
});

export const getPaymentByTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const payment = await getPaymentService().getPaymentByTaskId(taskId);
  if (!payment) {
    res.status(404).json({ success: false, error: 'Payment not found for this task.' });
    return;
  }
  res.json({ success: true, data: payment });
});

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.query.customerId as string | undefined;
  const status = req.query.status as any;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const result = await getPaymentService().listPayments({
    customerId: customerId || req.user!.userId,
    status,
    limit,
    offset,
  });

  res.json({ success: true, data: result });
});

export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, reason, reasonDetail } = req.body;

  const refund = await getPaymentService().processRefund({
    paymentId: id,
    amount,
    reason,
    reasonDetail,
    processedById: req.user!.userId,
  });

  res.json({ success: true, data: refund });
});

export const getPaymentAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const logs = await getPaymentService().getAuditLogs(id, limit, offset);
  res.json({ success: true, data: logs });
});

export const listAllPayments = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as any;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const result = await getPaymentService().listPayments({ status, limit, offset });
  res.json({ success: true, data: result });
});
