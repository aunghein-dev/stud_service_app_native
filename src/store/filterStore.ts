import { create } from 'zustand';
import type { ListQuery } from '@/types/common';

type FilterState = {
  filters: ListQuery;
  setFilter: <K extends keyof ListQuery>(key: K, value: ListQuery[K]) => void;
  resetFilters: () => void;
};

const initialFilters: ListQuery = {
  limit: 20,
  offset: 0
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    })),
  resetFilters: () => set({ filters: initialFilters })
}));
