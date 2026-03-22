import { create } from 'zustand';
import { receiptsApi } from '@/services/receiptsApi';
import type { Receipt } from '@/types/receipt';
import type { ListQuery } from '@/types/common';

type ReceiptState = {
  receipts: Receipt[];
  activeReceipt?: Receipt;
  loading: boolean;
  error?: string;
  fetchReceipts: (query?: ListQuery) => Promise<void>;
  fetchReceiptDetail: (key: string | number) => Promise<void>;
};

export const useReceiptStore = create<ReceiptState>((set) => ({
  receipts: [],
  activeReceipt: undefined,
  loading: false,
  error: undefined,
  fetchReceipts: async (query) => {
    set({ loading: true, error: undefined });
    try {
      const receipts = await receiptsApi.list(query);
      set({ receipts, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  fetchReceiptDetail: async (key) => {
    set({ loading: true, error: undefined });
    try {
      const activeReceipt = await receiptsApi.getByKey(key);
      set({ activeReceipt, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  }
}));
