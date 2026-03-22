import { apiClient } from '@/api/client';
import { toQueryString } from '@/utils/query';
import type { ListQuery } from '@/types/common';
import type { Receipt } from '@/types/receipt';

export const receiptsApi = {
  list: (query: ListQuery = {}) => apiClient.get<Receipt[]>(`/receipts${toQueryString(query)}`),
  getByKey: (key: string | number) => apiClient.get<Receipt>(`/receipts/${key}`)
};
