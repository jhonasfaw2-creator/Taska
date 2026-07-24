import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import * as matchingController from './matching.controller';

const matchingRoutes = Router();

matchingRoutes.use(requireAuth);

matchingRoutes.get('/tasks', matchingController.getMatchingTasks);
matchingRoutes.get('/taskers', matchingController.getMatchingTaskers);

export default matchingRoutes;
