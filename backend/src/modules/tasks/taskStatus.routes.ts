import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { updateStatus, getHistory } from './taskStatus.controller';

const router = Router();

router.use(requireAuth);

router.patch('/:taskId/status', updateStatus);
router.get('/:taskId/status-history', getHistory);

export default router;
