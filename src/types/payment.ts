import { ID, PaymentMethod } from './common';

export type Payment = {
  id: ID;
  receipt_no: string;
  student_id: ID;
  enrollment_id: ID;
  class_course_id: ID;
  payment_date: string;
  payment_method: PaymentMethod;
  amount: number;
  note: string;
  received_by: string;
  created_at: string;
};

export type PaymentInput = {
  enrollment_id: ID;
  payment_date: string;
  payment_method: PaymentMethod;
  amount: number;
  note?: string;
  received_by?: string;
};

export type PaymentUpdateInput = Omit<PaymentInput, 'enrollment_id'>;
