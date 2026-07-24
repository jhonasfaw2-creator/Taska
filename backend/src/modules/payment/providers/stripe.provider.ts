import {
  IPaymentProvider,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
} from './types';

export class StripePaymentProvider implements IPaymentProvider {
  private _stripe: any = null;

  private get stripe(): any {
    if (!this._stripe) {
      const Stripe = require('stripe');
      const stripeKey = process.env.STRIPE_SECRET_KEY || '';
      if (!stripeKey) {
        throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
      }
      this._stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
    }
    return this._stripe;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100),
      currency: request.currency.toLowerCase(),
      description: request.description,
      metadata: {
        ...request.metadata,
        customerId: request.customerId,
        idempotencyKey: request.idempotencyKey || '',
      },
      confirm: false,
    });

    return {
      providerPaymentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: request.amount,
      currency: request.currency,
      transactionReference: paymentIntent.id,
      redirectUrl: paymentIntent.next_action?.redirect_to_url?.url,
      metadata: paymentIntent.metadata as Record<string, unknown>,
    };
  }

  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    const refund = await this.stripe.refunds.create({
      payment_intent: request.providerPaymentId,
      amount: Math.round(request.amount * 100),
      reason: request.reason === 'DUPLICATE' ? 'duplicate' : 'requested_by_customer',
      metadata: request.metadata,
    });

    return {
      providerRefundId: refund.id,
      status: refund.status,
      amount: request.amount,
    };
  }

  verifyWebhookSignature(payload: Buffer, signature: string): boolean {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!endpointSecret) {
      return true;
    }
    try {
      this.stripe.webhooks.constructEvent(
        typeof payload === 'string' ? payload : payload.toString(),
        signature,
        endpointSecret,
      );
      return true;
    } catch {
      return false;
    }
  }

  getProviderName(): string {
    return 'STRIPE';
  }
}
