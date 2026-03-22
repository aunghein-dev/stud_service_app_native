import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { ClassCourse, OptionalFeeItem } from '@/types/classCourse';
import type { ListQuery } from '@/types/common';

type OptionalFeeInput = Pick<OptionalFeeItem, 'item_name' | 'default_amount' | 'is_optional' | 'is_active'>;

export const classCoursesApi = {
  list: (query: ListQuery = {}) => apiClient.get<ClassCourse[]>(`/class-courses${toQueryString(query)}`),
  getById: (id: number) => apiClient.get<ClassCourse>(`/class-courses/${id}`),
  create: (input: Omit<ClassCourse, 'id' | 'created_at' | 'updated_at'>) => apiClient.post<ClassCourse>('/class-courses', input),
  update: (id: number, input: Partial<ClassCourse>) => apiClient.put<ClassCourse>(`/class-courses/${id}`, input),
  remove: (id: number) => apiClient.delete<{ deleted: boolean }>(`/class-courses/${id}`),
  listOptionalFees: (classCourseId: number) => apiClient.get<OptionalFeeItem[]>(`/class-courses/${classCourseId}/optional-fees`),
  createOptionalFee: (classCourseId: number, input: OptionalFeeInput) =>
    apiClient.post<OptionalFeeItem>(`/class-courses/${classCourseId}/optional-fees`, input),
  updateOptionalFee: (id: number, input: OptionalFeeInput) =>
    apiClient.put<OptionalFeeItem>(`/optional-fees/${id}`, input),
  removeOptionalFee: (id: number) => apiClient.delete<{ deleted: boolean }>(`/optional-fees/${id}`)
};
