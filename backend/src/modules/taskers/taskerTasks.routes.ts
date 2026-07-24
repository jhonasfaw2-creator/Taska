import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import * as taskerTasksController from './taskerTasks.controller';

const router = Router();

router.use(requireAuth);

router.get('/tasks', taskerTasksController.getTasks);
router.get('/nearby-tasks', taskerTasksController.getNearbyTasks);
router.post('/location', taskerTasksController.updateLocation);
router.post('/:taskId/accept', taskerTasksController.acceptTask);

export default router;
