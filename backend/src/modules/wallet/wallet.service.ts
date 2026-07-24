import { prisma } from '../../prisma/client';
import { AppError } from '../../common/errors';

export class WalletService {
  async getOrCreateWallet(taskerId: string) {
    let wallet = await prisma.wallet.findUnique({ where: { taskerId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          taskerId,
          balance: 0,
          pendingBalance: 0,
          availableBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          totalRefunded: 0,
        },
      });
    }
    return wallet;
  }

  async getWallet(taskerId: string) {
    const wallet = await this.getOrCreateWallet(taskerId);
    return {
      id: wallet.id,
      taskerId: wallet.taskerId,
      balance: Number(wallet.balance),
      pendingBalance: Number(wallet.pendingBalance),
      availableBalance: Number(wallet.availableBalance),
      totalEarned: Number(wallet.totalEarned),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      totalRefunded: Number(wallet.totalRefunded),
      currency: wallet.currency,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async getTransactions(taskerId: string, limit = 50, offset = 0) {
    const wallet = await this.getOrCreateWallet(taskerId);
    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        referenceId: t.referenceId,
        createdAt: t.createdAt,
      })),
      total,
    };
  }

  async creditEarning(
    taskerId: string,
    amount: number,
    options?: { referenceId?: string; description?: string },
  ) {
    if (amount <= 0) throw new AppError('Amount must be positive.', 400);

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { taskerId },
        create: {
          taskerId,
          balance: amount,
          pendingBalance: 0,
          availableBalance: amount,
          totalEarned: amount,
          totalWithdrawn: 0,
          totalRefunded: 0,
        },
        update: {
          balance: { increment: amount },
          availableBalance: { increment: amount },
          totalEarned: { increment: amount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'TASK_EARNING',
          amount,
          description: options?.description || 'Task earning',
          referenceId: options?.referenceId || null,
        },
      });

      return Number(wallet.balance);
    });
  }

  async debitEarning(
    taskerId: string,
    amount: number,
    options?: { referenceId?: string; description?: string },
  ) {
    if (amount <= 0) throw new AppError('Amount must be positive.', 400);

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { taskerId } });
      if (!wallet) throw new AppError('Wallet not found.', 404);
      if (Number(wallet.availableBalance) < amount) {
        throw new AppError('Insufficient available balance.', 400);
      }

      const updated = await tx.wallet.update({
        where: { taskerId },
        data: {
          balance: { decrement: amount },
          availableBalance: { decrement: amount },
          totalRefunded: { increment: amount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: updated.id,
          type: 'REFUND',
          amount: -amount,
          description: options?.description || 'Refund debit',
          referenceId: options?.referenceId || null,
        },
      });

      return Number(updated.balance);
    });
  }

  async requestWithdrawal(taskerId: string, amount: number) {
    if (amount <= 0) throw new AppError('Amount must be positive.', 400);

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { taskerId } });
      if (!wallet) throw new AppError('Wallet not found.', 404);

      const available = Number(wallet.availableBalance);
      if (amount > available) {
        throw new AppError(
          `Insufficient available balance. Requested: ${amount}, Available: ${available}`,
          400,
        );
      }

      const updated = await tx.wallet.update({
        where: { taskerId },
        data: {
          balance: { decrement: amount },
          availableBalance: { decrement: amount },
          totalWithdrawn: { increment: amount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: updated.id,
          type: 'WITHDRAWAL',
          amount: -amount,
          description: 'Withdrawal request',
        },
      });

      return { balance: Number(updated.balance), withdrawn: amount };
    });
  }

  async getBalanceSummary(taskerId: string) {
    const wallet = await this.getOrCreateWallet(taskerId);
    return {
      balance: Number(wallet.balance),
      pendingBalance: Number(wallet.pendingBalance),
      availableBalance: Number(wallet.availableBalance),
      totalEarned: Number(wallet.totalEarned),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      totalRefunded: Number(wallet.totalRefunded),
      withdrawable: Number(wallet.availableBalance),
      currency: wallet.currency,
    };
  }
}
