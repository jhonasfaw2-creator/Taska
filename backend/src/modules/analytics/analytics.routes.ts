import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireAdmin } from '../../common/middleware/admin.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';
import * as ctrl from './analytics.controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/events', requirePermission('analytics:view'), ctrl.getEvents);
router.get('/events/:id', requirePermission('analytics:view'), ctrl.getEventById);
router.post('/events', requirePermission('analytics:view'), ctrl.trackEvent);
router.get('/summary', requirePermission('analytics:view'), ctrl.getSummary);
router.delete('/events', requirePermission('analytics:view'), ctrl.deleteEvents);

export default router;
