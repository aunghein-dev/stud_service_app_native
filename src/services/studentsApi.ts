import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { ListQuery } from '@/types/common';
import type { Student, StudentInput } from '@/types/student';

export const studentsApi = {
  list: (query: ListQuery = {}) => apiClient.get<Student[]>(`/students${toQueryString(query)}`),
  getById: (id: number) => apiClient.get<Student>(`/students/${id}`),
  create: (input: StudentInput) => apiClient.post<Student>('/students', input),
  update: (id: number, input: Partial<StudentInput>) => apiClient.put<Student>(`/students/${id}`, input),
  remove: (id: number) => apiClient.delete<{ deleted: boolean }>(`/students/${id}`),
  enrollments: (id: number, query: ListQuery = {}) => apiClient.get(`/students/${id}/enrollments${toQueryString(query)}`)
};
