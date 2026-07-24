import { prisma } from '../../prisma/client';

jest.mock('../../prisma/client', () => ({
  prisma: {
    wallet: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    walletTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn(prisma)),
  },
}));

import { WalletService } from '../../modules/wallet/wallet.service';

describe('WalletService', () => {
  let walletService: WalletService;

  beforeEach(() => {
    jest.clearAllMocks();
    walletService = new WalletService();
  });

  describe('getOrCreateWallet', () => {
    it('returns existing wallet', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        taskerId: 'tasker-1',
        balance: 500,
        pendingBalance: 0,
        availableBalance: 500,
        totalEarned: 1000,
        totalWithdrawn: 500,
        totalRefunded: 0,
        currency: 'ETB',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const wallet = await walletService.getOrCreateWallet('tasker-1');
      expect(wallet.id).toBe('wallet-1');
      expect(prisma.wallet.create).not.toHaveBeenCalled();
    });

    it('creates a new wallet if not found', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.wallet.create as jest.Mock).mockResolvedValue({
        id: 'wallet-new',
        taskerId: 'tasker-1',
        balance: 0,
        pendingBalance: 0,
        availableBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        totalRefunded: 0,
        currency: 'ETB',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const wallet = await walletService.getOrCreateWallet('tasker-1');
      expect(wallet.id).toBe('wallet-new');
      expect(prisma.wallet.create).toHaveBeenCalled();
    });
  });

  describe('creditEarning', () => {
    it('credits earnings to wallet', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
        return fn({
          wallet: {
            upsert: jest.fn().mockResolvedValue({
              id: 'wallet-1',
              taskerId: 'tasker-1',
              balance: 200,
              pendingBalance: 0,
              availableBalance: 200,
              totalEarned: 200,
              totalWithdrawn: 0,
              totalRefunded: 0,
              currency: 'ETB',
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          },
          walletTransaction: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await walletService.creditEarning('tasker-1', 200, {
        description: 'Task earning for task-1',
      });

      expect(result).toBe(200);
    });

    it('rejects negative amounts', async () => {
      await expect(walletService.creditEarning('tasker-1', -100)).rejects.toThrow(
        'Amount must be positive.',
      );
    });
  });

  describe('debitEarning', () => {
    it('debits earnings from wallet', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        taskerId: 'tasker-1',
        balance: 500,
        availableBalance: 500,
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
        return fn({
          wallet: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'wallet-1',
              taskerId: 'tasker-1',
              balance: 500,
              availableBalance: 500,
            }),
            update: jest.fn().mockResolvedValue({
              id: 'wallet-1',
              balance: 400,
              availableBalance: 400,
            }),
          },
          walletTransaction: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await walletService.debitEarning('tasker-1', 100);
      expect(result).toBe(400);
    });

    it('rejects debit exceeding available balance', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        taskerId: 'tasker-1',
        availableBalance: 50,
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
        return fn({
          wallet: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'wallet-1',
              taskerId: 'tasker-1',
              availableBalance: 50,
            }),
          },
        });
      });

      await expect(walletService.debitEarning('tasker-1', 100)).rejects.toThrow(
        'Insufficient available balance.',
      );
    });
  });

  describe('requestWithdrawal', () => {
    it('processes withdrawal successfully', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        taskerId: 'tasker-1',
        balance: 1000,
        availableBalance: 1000,
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
        return fn({
          wallet: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'wallet-1',
              taskerId: 'tasker-1',
              balance: 1000,
              availableBalance: 1000,
            }),
            update: jest.fn().mockResolvedValue({
              id: 'wallet-1',
              balance: 700,
              availableBalance: 700,
            }),
          },
          walletTransaction: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await walletService.requestWithdrawal('tasker-1', 300);
      expect(result.withdrawn).toBe(300);
    });
  });

  describe('getBalanceSummary', () => {
    it('returns balance summary', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        taskerId: 'tasker-1',
        balance: 1000,
        pendingBalance: 200,
        availableBalance: 800,
        totalEarned: 2000,
        totalWithdrawn: 1000,
        totalRefunded: 0,
        currency: 'ETB',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const summary = await walletService.getBalanceSummary('tasker-1');
      expect(summary.balance).toBe(1000);
      expect(summary.withdrawable).toBe(800);
    });
  });
});
