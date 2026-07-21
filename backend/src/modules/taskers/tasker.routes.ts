import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { apply, getProfile, updateStatus } from './tasker.controller';

const router = Router();

router.use(requireAuth);

router.post('/apply', apply);
router.get('/profile', getProfile);
router.patch('/status', updateStatus);

export default router;
