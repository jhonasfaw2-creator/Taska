export interface Wallet {
  id: string;
  taskerId: string;
  balance: number;
  pendingBalance: number;
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalRefunded: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceSummary {
  balance: number;
  pendingBalance: number;
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalRefunded: number;
  withdrawable: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string | null;
  description: string | null;
  status: string;
  createdAt: string;
}

export type TransactionType = 'CREDIT' | 'DEBIT' | 'WITHDRAWAL' | 'REFUND' | 'FEE';

export interface WithdrawalRequest {
  amount: number;
  paymentMethod?: string;
  accountDetails?: string;
}

export interface TransactionsResponse {
  transactions: WalletTransaction[];
  total: number;
}
