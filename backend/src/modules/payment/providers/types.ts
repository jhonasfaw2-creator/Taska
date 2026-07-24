export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
  customerId: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
  paymentMethodId?: string;
}

export interface PaymentResponse {
  providerPaymentId: string;
  status: string;
  amount: number;
  currency: string;
  transactionReference: string;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundRequest {
  providerPaymentId: string;
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface RefundResponse {
  providerRefundId: string;
  status: string;
  amount: number;
}

export interface IPaymentProvider {
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  processRefund(request: RefundRequest): Promise<RefundResponse>;
  verifyWebhookSignature(payload: Buffer, signature: string): boolean;
  getProviderName(): string;
}
