export type ID = number;

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type ExpenseType =
  | 'teacher_fee'
  | 'books'
  | 'uniform'
  | 'shoes'
  | 'stationery'
  | 'rent'
  | 'utilities'
  | 'marketing'
  | 'misc';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_wallet' | 'other';

export type ListQuery = {
  q?: string;
  date_from?: string;
  date_to?: string;
  teacher_name?: string;
  student_name?: string;
  class_course_name?: string;
  class_status?: string;
  course_category?: string;
  payment_status?: PaymentStatus;
  receipt_no?: string;
  expense_type?: ExpenseType;
  transaction_type?: string;
  limit?: number;
  offset?: number;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
};
