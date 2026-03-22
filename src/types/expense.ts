import { ID, ExpenseType } from './common';

export type Expense = {
  id: ID;
  expense_date: string;
  expense_type: ExpenseType;
  teacher_id?: ID;
  class_course_id?: ID;
  amount: number;
  description: string;
  payment_method: string;
  reference_no: string;
  created_at: string;
  updated_at: string;
};

export type ExpenseInput = Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
