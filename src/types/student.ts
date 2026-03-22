import { ID } from './common';

export type Student = {
  id: ID;
  student_code: string;
  full_name: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth?: string;
  phone: string;
  guardian_name: string;
  guardian_phone: string;
  address: string;
  school_name: string;
  grade_level: string;
  note: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StudentCreateInput = Omit<Student, 'id' | 'created_at' | 'updated_at'>;

export type StudentUpdateInput = Omit<StudentCreateInput, 'student_code'>;

export type StudentInput = StudentCreateInput;
