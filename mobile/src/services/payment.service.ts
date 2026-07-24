import api from '../config/api';
import type {
  Payment,
  CreatePaymentRequest,
  PaymentRefund,
  RefundPaymentRequest,
  PaymentAuditLog,
} from '../types/payment';

export async function createPayment(
  data: CreatePaymentRequest,
): Promise<Payment> {
  const response = await api.post<Payment>('/payments', data);
  return response.data;
}

export async function confirmPayment(
  paymentId: string,
): Promise<Payment> {
  const response = await api.post<Payment>(`/payments/${paymentId}/confirm`);
  return response.data;
}

export async function cancelPayment(
  paymentId: string,
): Promise<Payment> {
  const response = await api.post<Payment>(`/payments/${paymentId}/cancel`);
  return response.data;
}

export async function getPayment(
  paymentId: string,
): Promise<Payment> {
  const response = await api.get<Payment>(`/payments/${paymentId}`);
  return response.data;
}

export async function getPaymentByTask(
  taskId: string,
): Promise<Payment> {
  const response = await api.get<Payment>(`/payments/task/${taskId}`);
  return response.data;
}

export async function listPayments(): Promise<Payment[]> {
  const response = await api.get<Payment[]>('/payments');
  return response.data;
}

export async function refundPayment(
  data: RefundPaymentRequest,
): Promise<PaymentRefund> {
  const response = await api.post<PaymentRefund>(
    `/payments/${data.paymentId}/refund`,
    { amount: data.amount, reason: data.reason },
  );
  return response.data;
}

export async function getPaymentAuditLogs(
  paymentId: string,
): Promise<PaymentAuditLog[]> {
  const response = await api.get<PaymentAuditLog[]>(
    `/payments/${paymentId}/audit-logs`,
  );
  return response.data;
}

export async function listAllPayments(): Promise<Payment[]> {
  const response = await api.get<Payment[]>('/payments/admin/all');
  return response.data;
}
