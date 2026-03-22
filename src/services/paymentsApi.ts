import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { Payment, PaymentInput } from '@/types/payment';
import type { ListQuery } from '@/types/common';

export const paymentsApi = {
  list: (query: ListQuery = {}) => apiClient.get<Payment[]>(`/payments${toQueryString(query)}`),
  getById: (id: number) => apiClient.get<Payment>(`/payments/${id}`),
  create: (input: PaymentInput) => apiClient.post<{ payment: Payment; receipt: unknown }>('/payments', input),
  update: (id: number, input: Omit<PaymentInput, 'enrollment_id'>) => apiClient.put<Payment>(`/payments/${id}`, input),
  remove: (id: number) => apiClient.delete<{ deleted: boolean }>(`/payments/${id}`),
  listByEnrollment: (enrollmentId: number) => apiClient.get<Payment[]>(`/enrollments/${enrollmentId}/payments`)
};
