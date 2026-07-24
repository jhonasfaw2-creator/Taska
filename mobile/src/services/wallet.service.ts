import api from '../config/api';
import type {
  Wallet,
  BalanceSummary,
  TransactionsResponse,
  WithdrawalRequest,
} from '../types/wallet';

export async function getWallet(): Promise<Wallet> {
  const response = await api.get<Wallet>('/wallet');
  return response.data;
}

export async function getBalanceSummary(): Promise<BalanceSummary> {
  const response = await api.get<BalanceSummary>('/wallet/balance');
  return response.data;
}

export async function getTransactions(
  limit = 50,
  offset = 0,
): Promise<TransactionsResponse> {
  const response = await api.get<TransactionsResponse>('/wallet/transactions', {
    params: { limit, offset },
  });
  return response.data;
}

export async function requestWithdrawal(
  data: WithdrawalRequest,
): Promise<{ balance: number; withdrawn: number }> {
  const response = await api.post<{ balance: number; withdrawn: number }>(
    '/wallet/withdraw',
    data,
  );
  return response.data;
}

export async function getWalletByTaskerId(
  taskerId: string,
): Promise<Wallet> {
  const response = await api.get<Wallet>(`/wallet/admin/${taskerId}`);
  return response.data;
}
