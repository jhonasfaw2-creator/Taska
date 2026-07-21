import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getRecentTasks } from '../controllers/task.controller';
import { createTask, getMyTasks, getTaskById } from '../modules/tasks/tasks.controller';
import { acceptTask } from '../modules/taskerTasks/taskerTasks.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getRecentTasks);
router.post('/', createTask);
router.get('/my-tasks', getMyTasks);
router.get('/:taskId', getTaskById);
router.post('/:taskId/accept', acceptTask);

export default router;
