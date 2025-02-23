import api, { APIResponse } from './api';

export interface Transaction {
  id: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  hasMore: boolean;
}

class TransactionService {
  async getTransactions(page = 1, limit = 20): Promise<APIResponse<TransactionListResponse>> {
    return api.get(`/transactions?page=${page}&limit=${limit}`);
  }

  async getTransaction(id: string): Promise<APIResponse<Transaction>> {
    return api.get(`/transactions/${id}`);
  }

  async createTransaction(data: {
    productId: string;
    paymentMethod: string;
  }): Promise<APIResponse<Transaction>> {
    return api.post('/transactions', data);
  }

  async updateTransaction(id: string, status: Transaction['status']): Promise<APIResponse<Transaction>> {
    return api.patch(`/transactions/${id}`, { status });
  }
}

export default new TransactionService();
