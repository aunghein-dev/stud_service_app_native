import { create } from 'zustand';
import { studentsApi } from '@/services/studentsApi';
import type { Student, StudentCreateInput, StudentUpdateInput } from '@/types/student';
import type { ListQuery } from '@/types/common';

type StudentState = {
  students: Student[];
  loading: boolean;
  error?: string;
  fetchStudents: (query?: ListQuery) => Promise<void>;
  createStudent: (input: StudentCreateInput) => Promise<Student>;
  updateStudent: (id: number, input: StudentUpdateInput) => Promise<Student>;
  deleteStudent: (id: number) => Promise<void>;
};

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  loading: false,
  error: undefined,
  fetchStudents: async (query) => {
    set({ loading: true, error: undefined });
    try {
      const students = await studentsApi.list(query);
      set({ students, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  createStudent: async (input) => {
    const created = await studentsApi.create(input);
    set((state) => ({ students: [created, ...state.students] }));
    return created;
  },
  updateStudent: async (id, input) => {
    const updated = await studentsApi.update(id, input);
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? updated : s))
    }));
    return updated;
  },
  deleteStudent: async (id) => {
    await studentsApi.remove(id);
    set((state) => ({
      students: state.students.filter((s) => s.id !== id)
    }));
  }
}));
