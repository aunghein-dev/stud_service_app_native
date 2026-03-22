import { ID } from './common';

export type Teacher = {
  id: ID;
  teacher_code: string;
  teacher_name: string;
  phone: string;
  address: string;
  subject_specialty: string;
  salary_type: 'fixed_monthly' | 'fixed_per_class' | 'future_percentage_based';
  default_fee_amount: number;
  note: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
