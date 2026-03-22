import { ID } from './common';

export type ClassCourse = {
  id: ID;
  course_code: string;
  course_name: string;
  class_name: string;
  category: 'english_speaking' | 'academic' | 'exam_prep' | 'other';
  subject: string;
  level: string;
  start_date?: string;
  end_date?: string;
  schedule_text: string;
  days_of_week: string[];
  time_start: string;
  time_end: string;
  room: string;
  assigned_teacher_id?: number;
  max_students: number;
  status: 'planned' | 'open' | 'running' | 'completed' | 'closed';
  base_course_fee: number;
  registration_fee: number;
  exam_fee: number;
  certificate_fee: number;
  note: string;
  created_at: string;
  updated_at: string;
};

export type OptionalFeeItem = {
  id: ID;
  class_course_id: ID;
  item_name: string;
  default_amount: number;
  is_optional: boolean;
  is_active: boolean;
};
