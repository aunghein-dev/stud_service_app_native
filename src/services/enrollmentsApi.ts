import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { Enrollment, EnrollmentInput } from '@/types/enrollment';
import type { ListQuery } from '@/types/common';

export const enrollmentsApi = {
  list: (query: ListQuery = {}) => apiClient.get<Enrollment[]>(`/enrollments${toQueryString(query)}`),
  getById: (id: number) => apiClient.get<Enrollment>(`/enrollments/${id}`),
  create: (input: EnrollmentInput) => apiClient.post<{ enrollment: Enrollment; receipt?: unknown; initial_payment?: unknown }>('/enrollments', input),
  update: (id: number, input: Pick<EnrollmentInput, 'discount_amount'> & { note?: string }) => apiClient.put<Enrollment>(`/enrollments/${id}`, input),
  remove: (id: number) => apiClient.delete<{ deleted: boolean }>(`/enrollments/${id}`)
};
