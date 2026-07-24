import { AppError } from '../../common/errors';
import { PaymentProvider } from '@prisma/client';

const ALLOWED_PROVIDERS: PaymentProvider[] = ['STRIPE', 'CHAPA', 'TELEBIRR', 'CASH'];
const SUPPORTED_CURRENCIES = ['ETB', 'USD'];

export function validatePaymentProvider(provider: string): asserts provider is PaymentProvider {
  if (!ALLOWED_PROVIDERS.includes(provider as PaymentProvider)) {
    throw new AppError(
      `Invalid payment provider: ${provider}. Allowed: ${ALLOWED_PROVIDERS.join(', ')}`,
      400,
    );
  }
}

export function validateCurrency(currency: string): void {
  if (!SUPPORTED_CURRENCIES.includes(currency.toUpperCase())) {
    throw new AppError(
      `Unsupported currency: ${currency}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`,
      400,
    );
  }
}

export function validatePaymentAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('Payment amount must be a positive number.', 400);
  }
  if (amount > 1000000) {
    throw new AppError('Payment amount exceeds maximum allowed (1,000,000).', 400);
  }
}

export function validateRefundAmount(
  amount: number,
  paidAmount: number,
  alreadyRefunded: number,
): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('Refund amount must be a positive number.', 400);
  }
  if (amount + alreadyRefunded > paidAmount) {
    throw new AppError(
      `Refund amount ${amount} exceeds remaining refundable amount ${paidAmount - alreadyRefunded}.`,
      400,
    );
  }
}

export function validateIdempotencyKey(key: string): void {
  if (!key || key.length < 8 || key.length > 128) {
    throw new AppError('Idempotency key must be between 8 and 128 characters.', 400);
  }
}
