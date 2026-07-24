import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { getCategories } from './category.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getCategories);

export default router;
