import { apiClient } from '@/api/client';
import type { Settings } from '@/types/settings';

export const settingsApi = {
  get: () => apiClient.get<Settings>('/settings'),
  update: (input: Settings) => apiClient.put<Settings>('/settings', input)
};
