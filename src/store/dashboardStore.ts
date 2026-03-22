import { create } from 'zustand';
import { reportsApi } from '@/services/reportsApi';
import type { DashboardSummary, GrossReport } from '@/types/report';

type DashboardState = {
  summary?: DashboardSummary;
  gross?: GrossReport;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: undefined,
  gross: undefined,
  loading: false,
  error: undefined,
  refresh: async () => {
    set({ loading: true, error: undefined });
    try {
      const [summary, gross] = await Promise.all([reportsApi.dashboard(), reportsApi.gross()]);
      set({ summary, gross, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  }
}));
