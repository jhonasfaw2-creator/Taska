import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { getRecentTasks, createTask, getMyTasks, getTaskById } from './task.controller';
import { acceptTask } from '../taskers/taskerTasks.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getRecentTasks);
router.post('/', createTask);
router.get('/my-tasks', getMyTasks);
router.get('/:taskId', getTaskById);
router.post('/:taskId/accept', acceptTask);

export default router;
