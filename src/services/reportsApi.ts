import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { DashboardSummary, GrossReport } from '@/types/report';
import type { ListQuery } from '@/types/common';

export const reportsApi = {
  dashboard: () => apiClient.get<DashboardSummary>('/reports/dashboard'),
  students: (query: ListQuery = {}) => apiClient.get<Record<string, unknown>>(`/reports/students${toQueryString(query)}`),
  teachers: (query: ListQuery = {}) => apiClient.get<Record<string, unknown>>(`/reports/teachers${toQueryString(query)}`),
  classCourses: (query: ListQuery = {}) => apiClient.get<Record<string, unknown>>(`/reports/class-courses${toQueryString(query)}`),
  gross: (query: ListQuery = {}) => apiClient.get<GrossReport>(`/reports/gross${toQueryString(query)}`),
  transactions: (query: ListQuery = {}) => apiClient.get<Record<string, unknown>>(`/reports/transactions${toQueryString(query)}`),
  performance: (query: ListQuery = {}) => apiClient.get<Record<string, unknown>>(`/reports/performance${toQueryString(query)}`)
};
