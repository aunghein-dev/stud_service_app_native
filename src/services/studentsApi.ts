import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { ListQuery } from '@/types/common';
import type { Enrollment } from '@/types/enrollment';
import type { Student, StudentCreateInput, StudentUpdateInput } from '@/types/student';

export const studentsApi = {
  list: (query: ListQuery = {}) => apiClient.get<Student[]>(`/students${toQueryString(query)}`),
  getById: (id: number) => apiClient.get<Student>(`/students/${id}`),
  create: (input: StudentCreateInput) => apiClient.post<Student>('/students', input),
  update: (id: number, input: StudentUpdateInput) => apiClient.put<Student>(`/students/${id}`, input),
  remove: (id: number) => apiClient.delete<{ deleted: boolean }>(`/students/${id}`),
  enrollments: (id: number, query: ListQuery = {}) =>
    apiClient.get<Enrollment[]>(`/students/${id}/enrollments${toQueryString(query)}`)
};
