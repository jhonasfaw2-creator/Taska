import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { getTasks } from './taskerTasks.controller';

const router = Router();

router.use(requireAuth);

router.get('/tasks', getTasks);

export default router;
