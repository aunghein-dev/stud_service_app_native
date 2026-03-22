import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { ListQuery } from '@/types/common';
import type { Teacher } from '@/types/teacher';

export const teachersApi = {
  list: (query: ListQuery = {}) => apiClient.get<Teacher[]>(`/teachers${toQueryString(query)}`),
  getById: (id: number) => apiClient.get<Teacher>(`/teachers/${id}`),
  create: (input: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) => apiClient.post<Teacher>('/teachers', input),
  update: (id: number, input: Partial<Teacher>) => apiClient.put<Teacher>(`/teachers/${id}`, input),
  remove: (id: number) => apiClient.delete<{ deleted: boolean }>(`/teachers/${id}`)
};
