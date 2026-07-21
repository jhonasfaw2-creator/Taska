import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getProfile,
  updateProfile,
  updateRole,
} from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// ─── GET /users/profile ───────────────────────────────
router.get('/profile', getProfile);

// ─── PATCH /users/profile ─────────────────────────────
router.patch('/profile', updateProfile);

// ─── PATCH /users/role ────────────────────────────────
router.patch('/role', updateRole);

export default router;
