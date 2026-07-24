import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { StripePaymentProvider } from './providers';
import { WalletService } from '../wallet/wallet.service';

const walletService = new WalletService();
const paymentProvider = new StripePaymentProvider();
const paymentService = new PaymentService(paymentProvider, walletService);

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  if (!paymentProvider.verifyWebhookSignature(req.body, sig)) {
    res.status(401).json({ success: false, error: 'Invalid webhook signature.' });
    return;
  }

  // The body arrives as a raw Buffer via express.raw() — parse it to JSON
  let event: { type: string; data?: { object?: Record<string, unknown> } };
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
    event = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    res.status(400).json({ success: false, error: 'Invalid webhook payload.' });
    return;
  }

  try {
    await paymentService.handleWebhook(event.type, event.data?.object || {});
    res.json({ success: true, received: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Webhook processing failed.' });
  }
};

export const handleGenericWebhook = async (req: Request, res: Response): Promise<void> => {
  const { event, data } = req.body;

  if (!event) {
    res.status(400).json({ success: false, error: 'Event type is required.' });
    return;
  }

  try {
    await paymentService.handleWebhook(event, data || {});
    res.json({ success: true, received: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Webhook processing failed.' });
  }
};
