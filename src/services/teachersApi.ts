import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { ListQuery } from '@/types/common';
import type { Teacher, TeacherCreateInput, TeacherUpdateInput } from '@/types/teacher';

export const teachersApi = {
  list: (query: ListQuery = {}) => apiClient.get<Teacher[]>(`/teachers${toQueryString(query)}`),
  getById: (id: number) => apiClient.get<Teacher>(`/teachers/${id}`),
  create: (input: TeacherCreateInput) => apiClient.post<Teacher>('/teachers', input),
  update: (id: number, input: TeacherUpdateInput) => apiClient.put<Teacher>(`/teachers/${id}`, input),
  remove: (id: number) => apiClient.delete<{ deleted: boolean }>(`/teachers/${id}`)
};
