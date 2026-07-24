import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { getProfile, updateProfile, updateRole } from './user.controller';

const router = Router();

router.use(requireAuth);

router.get('/profile', getProfile);

router.patch('/profile', updateProfile);

router.patch('/role', updateRole);

export default router;
