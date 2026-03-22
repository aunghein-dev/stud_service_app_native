import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { Expense, ExpenseInput } from '@/types/expense';
import type { ListQuery } from '@/types/common';

export const expensesApi = {
  list: (query: ListQuery = {}) => apiClient.get<Expense[]>(`/expenses${toQueryString(query)}`),
  getById: (id: number) => apiClient.get<Expense>(`/expenses/${id}`),
  create: (input: ExpenseInput) => apiClient.post<Expense>('/expenses', input),
  update: (id: number, input: ExpenseInput) => apiClient.put<Expense>(`/expenses/${id}`, input),
  remove: (id: number) => apiClient.delete<{ deleted: boolean }>(`/expenses/${id}`)
};
