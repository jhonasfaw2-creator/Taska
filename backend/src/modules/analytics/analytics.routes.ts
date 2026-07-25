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
router.get('/charts/user-growth', requirePermission('analytics:view'), ctrl.getUserGrowth);
router.get('/charts/task-growth', requirePermission('analytics:view'), ctrl.getTaskGrowth);
router.get('/charts/revenue-trend', requirePermission('analytics:view'), ctrl.getRevenueTrend);
router.get('/charts/popular-categories', requirePermission('analytics:view'), ctrl.getPopularCategories);
router.get('/revenue', requirePermission('analytics:view'), ctrl.getRevenueAnalytics);
router.get('/tasks', requirePermission('analytics:view'), ctrl.getTaskAnalytics);
router.get('/users', requirePermission('analytics:view'), ctrl.getUserAnalytics);
router.get('/summary', requirePermission('analytics:view'), ctrl.getSummary);
router.delete('/events', requirePermission('analytics:view'), ctrl.deleteEvents);

export default router;
