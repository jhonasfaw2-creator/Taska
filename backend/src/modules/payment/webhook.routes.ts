import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook, handleGenericWebhook } from './webhook.controller';

const router = Router();

router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.post('/generic', express.json(), handleGenericWebhook);

export default router;
