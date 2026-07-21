import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import {
  registerDevice,
  getNotifications,
  markAsRead,
} from './notification.controller';

const router = Router();

router.use(requireAuth);

router.post('/register-device', registerDevice);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
