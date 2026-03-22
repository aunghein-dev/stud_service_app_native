import { create } from 'zustand';
import { enrollmentsApi } from '@/services/enrollmentsApi';
import type { Enrollment, EnrollmentInput } from '@/types/enrollment';
import type { ListQuery } from '@/types/common';

type EnrollmentState = {
  enrollments: Enrollment[];
  loading: boolean;
  error?: string;
  fetchEnrollments: (query?: ListQuery) => Promise<void>;
  createEnrollment: (input: EnrollmentInput) => Promise<{ enrollment: Enrollment; receipt?: unknown }>;
  updateEnrollment: (id: number, input: { discount_amount: number; note?: string }) => Promise<Enrollment>;
  deleteEnrollment: (id: number) => Promise<void>;
};

export const useEnrollmentStore = create<EnrollmentState>((set) => ({
  enrollments: [],
  loading: false,
  error: undefined,
  fetchEnrollments: async (query) => {
    set({ loading: true, error: undefined });
    try {
      const enrollments = await enrollmentsApi.list(query);
      set({ enrollments, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  createEnrollment: async (input) => {
    const result = await enrollmentsApi.create(input);
    set((state) => ({ enrollments: [result.enrollment, ...state.enrollments] }));
    return { enrollment: result.enrollment, receipt: result.receipt };
  },
  updateEnrollment: async (id, input) => {
    const updated = await enrollmentsApi.update(id, input);
    set((state) => ({
      enrollments: state.enrollments.map((e) => (e.id === id ? updated : e))
    }));
    return updated;
  },
  deleteEnrollment: async (id) => {
    await enrollmentsApi.remove(id);
    set((state) => ({
      enrollments: state.enrollments.filter((e) => e.id !== id)
    }));
  }
}));
