import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getCategories } from '../controllers/category.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getCategories);

export default router;
