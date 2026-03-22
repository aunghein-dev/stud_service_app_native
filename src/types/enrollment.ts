import { ID, PaymentMethod, PaymentStatus } from './common';

export type EnrollmentOptionalItem = {
  id: ID;
  optional_fee_item_id?: ID;
  item_name_snapshot: string;
  amount_snapshot: number;
  quantity: number;
  total_amount: number;
};

export type Enrollment = {
  id: ID;
  enrollment_code: string;
  student_id: ID;
  student_name?: string;
  guardian_name?: string;
  class_course_id: ID;
  class_name?: string;
  course_name?: string;
  enrollment_date: string;
  sub_total: number;
  discount_amount: number;
  final_fee: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: PaymentStatus;
  note: string;
  optional_items?: EnrollmentOptionalItem[];
  created_at: string;
  updated_at: string;
};

export type EnrollmentInput = {
  student_id: ID;
  class_course_id: ID;
  enrollment_date: string;
  discount_amount: number;
  optional_items: {
    optional_fee_item_id?: ID;
    item_name: string;
    amount: number;
    quantity: number;
  }[];
  initial_payment: number;
  payment_method?: PaymentMethod;
  received_by?: string;
  note?: string;
  allow_duplicate?: boolean;
};
