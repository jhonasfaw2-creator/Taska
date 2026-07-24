import { Prisma, PaymentStatus, PaymentProvider, RefundReason } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../common/errors';
import { IPaymentProvider, PaymentRequest } from './providers/types';
import {
  validateCurrency,
  validatePaymentAmount,
  validateRefundAmount,
  validateIdempotencyKey,
} from './payment.validation';
import { WalletService } from '../wallet/wallet.service';

const AUDIT_EVENTS = {
  CREATED: 'CREATED',
  PROCESSING: 'PROCESSING',
  AUTHORIZED: 'AUTHORIZED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUND_INITIATED: 'REFUND_INITIATED',
  REFUND_COMPLETED: 'REFUND_COMPLETED',
  WEBHOOK_RECEIVED: 'WEBHOOK_RECEIVED',
} as const;

export class PaymentService {
  constructor(
    private provider: IPaymentProvider,
    private walletService: WalletService,
  ) {}

  async createPayment(params: {
    taskId: string;
    customerId: string;
    amount: number;
    currency?: string;
    description?: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
  }) {
    const {
      taskId,
      customerId,
      amount,
      currency = 'ETB',
      description,
      idempotencyKey,
      metadata,
    } = params;

    validatePaymentAmount(amount);
    validateCurrency(currency);

    if (idempotencyKey) {
      validateIdempotencyKey(idempotencyKey);
      const existing = await prisma.payment.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return this.toPaymentResponse(existing);
      }
    }

    const existingPayment = await prisma.payment.findUnique({ where: { taskId } });
    if (existingPayment) {
      throw new AppError('Payment already exists for this task.', 409);
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { tasker: true },
    });
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    const platformFee = this.calculatePlatformFee(amount);
    const taskerAmount = amount - platformFee;

    const payment = await prisma.payment.create({
      data: {
        taskId,
        customerId,
        amount,
        platformFee,
        taskerAmount,
        paymentMethod: this.provider.getProviderName(),
        paymentStatus: 'PENDING',
        provider: this.provider.getProviderName() as PaymentProvider,
        idempotencyKey,
        description: description || `Payment for task: ${task.title}`,
        metadata: metadata as any,
      },
    });

    await this.auditLog(payment.id, AUDIT_EVENTS.CREATED, null, 'PENDING', { amount, currency });

    let providerResponse: Awaited<ReturnType<IPaymentProvider['createPayment']>> | null = null;
    let updatedPayment = payment;
    try {
      const paymentRequest: PaymentRequest = {
        amount,
        currency,
        description: description || `Payment for task: ${task.title}`,
        metadata: { ...metadata, taskId, paymentId: payment.id },
        idempotencyKey,
        customerId,
      };

      providerResponse = await this.provider.createPayment(paymentRequest);

      updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: providerResponse.providerPaymentId,
          transactionReference: providerResponse.transactionReference,
          paymentStatus: 'PROCESSING',
        },
      });

      await this.auditLog(payment.id, AUDIT_EVENTS.PROCESSING, 'PENDING', 'PROCESSING', {
        providerPaymentId: providerResponse.providerPaymentId,
      });
    } catch (err) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: 'FAILED' },
      });
      await this.auditLog(payment.id, AUDIT_EVENTS.FAILED, 'PENDING', 'FAILED', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      throw err;
    }

    return {
      ...this.toPaymentResponse(updatedPayment),
      providerPaymentId: providerResponse.providerPaymentId,
      redirectUrl: providerResponse.redirectUrl,
      transactionReference: providerResponse.transactionReference,
    };
  }

  async confirmPayment(paymentId: string): Promise<PaymentResponse> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new AppError('Payment not found.', 404);
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });

    const task = await prisma.task.findUnique({ where: { id: payment.taskId } });
    if (task?.taskerId) {
      await this.walletService.creditEarning(task.taskerId, Number(payment.taskerAmount), {
        referenceId: paymentId,
        description: `Earning for task ${payment.taskId}`,
      });
    }

    await this.auditLog(paymentId, AUDIT_EVENTS.COMPLETED, payment.paymentStatus, 'PAID', {});

    return this.toPaymentResponse(updated);
  }

  async failPayment(paymentId: string, reason?: string): Promise<PaymentResponse> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new AppError('Payment not found.', 404);
    }
    if (payment.paymentStatus === 'PAID') {
      throw new AppError('Cannot fail a completed payment.', 400);
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { paymentStatus: 'FAILED' },
    });

    await this.auditLog(paymentId, AUDIT_EVENTS.FAILED, payment.paymentStatus, 'FAILED', {
      reason,
    });
    return this.toPaymentResponse(updated);
  }

  async cancelPayment(paymentId: string, userId: string): Promise<PaymentResponse> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new AppError('Payment not found.', 404);
    }
    if (!['PENDING', 'PROCESSING'].includes(payment.paymentStatus)) {
      throw new AppError(`Cannot cancel payment in status: ${payment.paymentStatus}.`, 400);
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { paymentStatus: 'CANCELLED' },
    });

    await this.auditLog(paymentId, AUDIT_EVENTS.CANCELLED, payment.paymentStatus, 'CANCELLED', {
      cancelledBy: userId,
    });
    return this.toPaymentResponse(updated);
  }

  async processRefund(params: {
    paymentId: string;
    amount: number;
    reason: RefundReason;
    reasonDetail?: string;
    processedById?: string;
  }) {
    const { paymentId, amount, reason, reasonDetail, processedById } = params;

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new AppError('Payment not found.', 404);
    }
    if (payment.paymentStatus !== 'PAID') {
      throw new AppError('Can only refund completed payments.', 400);
    }

    const paidAmount = Number(payment.amount);
    const alreadyRefunded = Number(payment.refundedAmount);
    validateRefundAmount(amount, paidAmount, alreadyRefunded);

    let providerResponse: { providerRefundId: string; status: string; amount: number } | null =
      null;
    if (payment.providerPaymentId) {
      try {
        providerResponse = await this.provider.processRefund({
          providerPaymentId: payment.providerPaymentId,
          amount,
          reason: reason.toString(),
          metadata: { paymentId, processedById },
        });
      } catch (err) {
        throw new AppError(
          `Refund failed at provider: ${err instanceof Error ? err.message : 'Unknown error'}`,
          502,
        );
      }
    }

    const refund = await prisma.$transaction(async (tx) => {
      const refundRecord = await tx.paymentRefund.create({
        data: {
          paymentId,
          amount,
          reason,
          reasonDetail: reasonDetail || null,
          status: 'COMPLETED',
          providerRefundId: providerResponse?.providerRefundId || null,
          processedById: processedById || null,
        },
      });

      const newRefundedAmount = Number(payment.refundedAmount) + amount;
      const newStatus = newRefundedAmount >= paidAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

      await tx.payment.update({
        where: { id: paymentId },
        data: {
          refundedAmount: newRefundedAmount,
          paymentStatus: newStatus,
        },
      });

      const task = await tx.task.findUnique({ where: { id: payment.taskId } });
      if (task?.taskerId) {
        await this.walletService.debitEarning(task.taskerId, amount, {
          referenceId: paymentId,
          description: `Refund for task ${payment.taskId}`,
        });
      }

      return refundRecord;
    });

    await this.auditLog(
      paymentId,
      AUDIT_EVENTS.REFUND_COMPLETED,
      payment.paymentStatus,
      amount >= Number(payment.amount) ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      { refundId: refund.id, amount, reason },
    );

    return refund;
  }

  async handleWebhook(event: string, data: Record<string, unknown>): Promise<void> {
    const providerPaymentId = data.payment_intent || data.providerPaymentId || '';
    if (!providerPaymentId) return;

    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: providerPaymentId as string },
    });
    if (!payment) return;

    await this.auditLog(payment.id, AUDIT_EVENTS.WEBHOOK_RECEIVED, null, null, { event, data });

    switch (event) {
      case 'payment_intent.succeeded':
        if (payment.paymentStatus !== 'PAID') {
          await this.confirmPayment(payment.id);
        }
        break;
      case 'payment_intent.payment_failed':
        if (['PENDING', 'PROCESSING'].includes(payment.paymentStatus)) {
          await this.failPayment(payment.id, String(data.failure_message || ''));
        }
        break;
    }
  }

  async getPaymentById(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { refunds: true, task: true },
    });
    if (!payment) return null;
    return this.toPaymentResponse(payment);
  }

  async getPaymentByTaskId(taskId: string) {
    const payment = await prisma.payment.findUnique({
      where: { taskId },
      include: { refunds: true },
    });
    if (!payment) return null;
    return this.toPaymentResponse(payment);
  }

  async listPayments(params: {
    customerId?: string;
    status?: PaymentStatus;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.PaymentWhereInput = {};
    if (params.customerId) where.customerId = params.customerId;
    if (params.status) where.paymentStatus = params.status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit || 50,
        skip: params.offset || 0,
        include: { task: { select: { title: true } } },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments: payments.map((p) => this.toPaymentResponse(p)), total };
  }

  async listRefunds(paymentId: string) {
    return prisma.paymentRefund.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAuditLogs(paymentId: string, limit = 50, offset = 0) {
    return prisma.paymentAuditLog.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  private async auditLog(
    paymentId: string,
    event: string,
    fromStatus: string | null,
    toStatus: string | null,
    data: Record<string, unknown>,
  ) {
    await prisma.paymentAuditLog.create({
      data: {
        paymentId,
        event,
        fromStatus,
        toStatus,
        data: data as any,
      },
    });
  }

  private calculatePlatformFee(amount: number): number {
    const feePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '0.1');
    return Math.round(amount * feePercentage * 100) / 100;
  }

  private toPaymentResponse(payment: any) {
    return {
      id: payment.id,
      taskId: payment.taskId,
      customerId: payment.customerId,
      amount: Number(payment.amount),
      platformFee: Number(payment.platformFee),
      taskerAmount: Number(payment.taskerAmount),
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      provider: payment.provider,
      transactionReference: payment.transactionReference,
      refundedAmount: Number(payment.refundedAmount),
      description: payment.description,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      task: payment.task ? { title: payment.task.title } : undefined,
      refunds: payment.refunds,
    };
  }
}

interface PaymentResponse {
  id: string;
  taskId: string;
  customerId: string;
  amount: number;
  platformFee: number;
  taskerAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  provider: string;
  transactionReference: string | null;
  refundedAmount: number;
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  task?: { title: string };
  refunds?: any[];
}
