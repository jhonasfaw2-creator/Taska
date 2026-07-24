import { PaymentService } from '../../modules/payment/payment.service';
import {
  IPaymentProvider,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
} from '../../modules/payment/providers/types';
import { prisma } from '../../prisma/client';

class MockPaymentProvider implements IPaymentProvider {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return {
      providerPaymentId: 'pi_mock_123',
      status: 'requires_payment_method',
      amount: request.amount,
      currency: request.currency,
      transactionReference: 'pi_mock_123',
    };
  }

  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    return {
      providerRefundId: 're_mock_123',
      status: 'succeeded',
      amount: request.amount,
    };
  }

  verifyWebhookSignature(payload: Buffer, signature: string): boolean {
    return true;
  }

  getProviderName(): string {
    return 'STRIPE';
  }
}

class MockWalletService {
  async getOrCreateWallet(taskerId: string) {
    return {
      id: 'wallet-id',
      taskerId,
      balance: 1000,
      pendingBalance: 0,
      availableBalance: 1000,
      totalEarned: 2000,
      totalWithdrawn: 1000,
      totalRefunded: 0,
      currency: 'ETB',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async creditEarning(taskerId: string, amount: number, options?: any) {
    return 1000;
  }

  async debitEarning(taskerId: string, amount: number, options?: any) {
    return 900;
  }

  async requestWithdrawal(taskerId: string, amount: number) {
    return { balance: 0, withdrawn: amount };
  }

  async getBalanceSummary(taskerId: string) {
    return {
      balance: 1000,
      pendingBalance: 0,
      availableBalance: 1000,
      totalEarned: 2000,
      totalWithdrawn: 1000,
      totalRefunded: 0,
      withdrawable: 1000,
      currency: 'ETB',
    };
  }

  async getTransactions(taskerId: string, limit = 50, offset = 0) {
    return { transactions: [], total: 0 };
  }

  async getWallet(taskerId: string) {
    return {
      id: 'wallet-id',
      taskerId,
      balance: 1000,
      pendingBalance: 0,
      availableBalance: 1000,
      totalEarned: 2000,
      totalWithdrawn: 1000,
      totalRefunded: 0,
      currency: 'ETB',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

jest.mock('../../prisma/client', () => ({
  prisma: {
    payment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    paymentRefund: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    paymentAuditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn(prisma)),
  },
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockProvider: MockPaymentProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider = new MockPaymentProvider();
    paymentService = new PaymentService(mockProvider, new MockWalletService() as any);
  });

  describe('createPayment', () => {
    it('creates a payment successfully', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: 'task-1',
        title: 'Test Task',
        taskerId: 'tasker-1',
      });
      (prisma.payment.create as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        taskId: 'task-1',
        customerId: 'customer-1',
        amount: 100,
        platformFee: 10,
        taskerAmount: 90,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PENDING',
        provider: 'STRIPE',
        transactionReference: null,
        refundedAmount: 0,
        description: 'Test payment',
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (prisma.payment.update as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        taskId: 'task-1',
        customerId: 'customer-1',
        amount: 100,
        platformFee: 10,
        taskerAmount: 90,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PROCESSING',
        provider: 'STRIPE',
        transactionReference: 'pi_mock_123',
        refundedAmount: 0,
        description: 'Test payment',
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await paymentService.createPayment({
        taskId: 'task-1',
        customerId: 'customer-1',
        amount: 100,
        currency: 'ETB',
        idempotencyKey: 'idemp-123',
      });

      expect(result.paymentStatus).toBe('PROCESSING');
      expect(result.providerPaymentId).toBe('pi_mock_123');
    });

    it('rejects duplicate payment for same task', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-payment',
      });

      await expect(
        paymentService.createPayment({
          taskId: 'task-1',
          customerId: 'customer-1',
          amount: 100,
        }),
      ).rejects.toThrow('Payment already exists for this task.');
    });

    it('returns existing payment for duplicate idempotency key', async () => {
      const existingPayment = {
        id: 'payment-1',
        taskId: 'task-1',
        customerId: 'customer-1',
        amount: 100,
        platformFee: 10,
        taskerAmount: 90,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PAID',
        provider: 'STRIPE',
        transactionReference: 'ref-123',
        refundedAmount: 0,
        description: 'Test',
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.payment.findUnique as jest.Mock).mockImplementation(({ where }: any) => {
        if (where.idempotencyKey) return Promise.resolve(existingPayment);
        return Promise.resolve(null);
      });

      const result = await paymentService.createPayment({
        taskId: 'task-2',
        customerId: 'customer-1',
        amount: 100,
        idempotencyKey: 'dup-key1',
      });

      expect(result.id).toBe('payment-1');
    });
  });

  describe('confirmPayment', () => {
    it('confirms a payment and credits wallet', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        taskId: 'task-1',
        paymentStatus: 'PROCESSING',
        taskerAmount: 90,
        customerId: 'customer-1',
        amount: 100,
        platformFee: 10,
      });
      (prisma.payment.update as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        taskId: 'task-1',
        paymentStatus: 'PAID',
        taskerAmount: 90,
        paidAt: new Date(),
        customerId: 'customer-1',
        amount: 100,
        platformFee: 10,
        provider: 'STRIPE',
        paymentMethod: 'STRIPE',
        transactionReference: 'ref-123',
        refundedAmount: 0,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: 'task-1',
        taskerId: 'tasker-1',
      });

      const result = await paymentService.confirmPayment('payment-1');
      expect(result.paymentStatus).toBe('PAID');
    });
  });

  describe('processRefund', () => {
    it('processes a full refund', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        taskId: 'task-1',
        paymentStatus: 'PAID',
        amount: 100,
        refundedAmount: 0,
        providerPaymentId: 'pi_mock_123',
        customerId: 'customer-1',
        platformFee: 10,
        taskerAmount: 90,
        paymentMethod: 'STRIPE',
        provider: 'STRIPE',
        transactionReference: 'ref-123',
        description: null,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (prisma.paymentRefund.create as jest.Mock).mockResolvedValue({
        id: 'refund-1',
        paymentId: 'payment-1',
        amount: 100,
        status: 'COMPLETED',
      });
      (prisma.payment.update as jest.Mock).mockResolvedValue({});
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: 'task-1',
        taskerId: 'tasker-1',
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
        return fn({
          paymentRefund: {
            create: jest.fn().mockResolvedValue({
              id: 'refund-1',
              paymentId: 'payment-1',
              amount: 100,
              status: 'COMPLETED',
            }),
          },
          payment: {
            update: jest.fn().mockResolvedValue({}),
          },
          task: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'task-1',
              taskerId: 'tasker-1',
            }),
          },
        });
      });

      const result = await paymentService.processRefund({
        paymentId: 'payment-1',
        amount: 100,
        reason: 'CUSTOMER_REQUEST' as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('refund-1');
    });
  });

  describe('getPaymentById', () => {
    it('returns null for non-existent payment', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await paymentService.getPaymentById('non-existent');
      expect(result).toBeNull();
    });
  });
});
