import { Router } from 'express';
import { sendOtp, verifyOtp, refreshToken } from '../controllers/auth.controller';

const router = Router();

// ─── POST /auth/send-otp ──────────────────────────────
router.post('/send-otp', sendOtp);

// ─── POST /auth/verify-otp ────────────────────────────
router.post('/verify-otp', verifyOtp);

// ─── POST /auth/refresh-token ─────────────────────────
router.post('/refresh-token', refreshToken);

export default router;
