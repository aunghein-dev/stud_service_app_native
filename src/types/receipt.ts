import { ID } from './common';

export type Receipt = {
  id: ID;
  receipt_no: string;
  receipt_type: string;
  student_id: ID;
  enrollment_id: ID;
  payment_id?: ID;
  class_course_id: ID;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payload: Record<string, unknown>;
  issued_at: string;
  created_at: string;
};
