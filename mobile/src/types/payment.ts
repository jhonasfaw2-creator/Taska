export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 'STRIPE' | 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER';

export type PaymentProvider = 'STRIPE' | 'CASH';

export interface Payment {
  id: string;
  taskId: string;
  customerId: string;
  amount: number;
  platformFee: number;
  taskerAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  provider: PaymentProvider;
  providerPaymentId: string | null;
  transactionReference: string | null;
  refundedAmount: number;
  description: string | null;
  idempotencyKey: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  taskId: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  description?: string;
  customerId?: string;
  idempotencyKey?: string;
}

export interface RefundPaymentRequest {
  paymentId: string;
  amount: number;
  reason: RefundReason;
}

export type RefundReason =
  | 'DUPLICATE'
  | 'FRAUD'
  | 'CUSTOMER_REQUEST'
  | 'TASK_CANCELLED'
  | 'SERVICE_ISSUE'
  | 'OTHER';

export interface PaymentRefund {
  id: string;
  paymentId: string;
  amount: number;
  status: string;
  reason: RefundReason;
  providerRefundId: string | null;
  createdAt: string;
}

export interface PaymentAuditLog {
  id: number;
  paymentId: string;
  event: string;
  fromStatus: string | null;
  toStatus: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
