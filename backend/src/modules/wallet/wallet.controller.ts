import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { WalletService } from './wallet.service';
import { AppError } from '../../common/errors';
import { prisma } from '../../prisma/client';

const walletService = new WalletService();

/**
 * Resolve the TaskerProfile.id for the authenticated user.
 */
async function resolveTaskerId(userId: string): Promise<string> {
  const profile = await prisma.taskerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    throw new AppError('Tasker profile not found.', 404);
  }
  return profile.id;
}

export const getWallet = asyncHandler(async (req: Request, res: Response) => {
  const taskerId = await resolveTaskerId(req.user!.userId);
  const wallet = await walletService.getWallet(taskerId);
  res.json({ success: true, data: wallet });
});

export const getBalanceSummary = asyncHandler(async (req: Request, res: Response) => {
  const taskerId = await resolveTaskerId(req.user!.userId);
  const summary = await walletService.getBalanceSummary(taskerId);
  res.json({ success: true, data: summary });
});

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const taskerId = await resolveTaskerId(req.user!.userId);
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const result = await walletService.getTransactions(taskerId, limit, offset);
  res.json({ success: true, data: result });
});

export const requestWithdrawal = asyncHandler(async (req: Request, res: Response) => {
  const taskerId = await resolveTaskerId(req.user!.userId);
  const { amount } = req.body;
  const result = await walletService.requestWithdrawal(taskerId, amount);
  res.json({ success: true, data: result });
});

export const getWalletByTaskerId = asyncHandler(async (req: Request, res: Response) => {
  const { taskerId } = req.params;
  const wallet = await walletService.getWallet(taskerId);
  res.json({ success: true, data: wallet });
});
