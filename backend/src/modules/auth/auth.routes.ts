import { Router } from 'express';
import { sendOtp, verifyOtp, refreshToken } from './auth.controller';

const router = Router();

router.post('/send-otp', sendOtp);

router.post('/verify-otp', verifyOtp);

router.post('/refresh-token', refreshToken);

export default router;
