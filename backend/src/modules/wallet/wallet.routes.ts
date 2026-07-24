import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireAdmin } from '../../common/middleware/admin.middleware';
import {
  getWallet,
  getBalanceSummary,
  getTransactions,
  requestWithdrawal,
  getWalletByTaskerId,
} from './wallet.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getWallet);
router.get('/balance', getBalanceSummary);
router.get('/transactions', getTransactions);
router.post('/withdraw', requestWithdrawal);
router.get('/admin/:taskerId', requireAdmin, getWalletByTaskerId);

export default router;
