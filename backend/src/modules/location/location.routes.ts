import { Router } from 'express';
import { LocationController } from './location.controller';
import { requireAuth } from '../../common/middleware/auth.middleware';

const locationRoutes = Router();

locationRoutes.get('/nearby-taskers', requireAuth, LocationController.getNearbyTaskers);
locationRoutes.get('/nearby-tasks', requireAuth, LocationController.getNearbyTasks);

export default locationRoutes;
