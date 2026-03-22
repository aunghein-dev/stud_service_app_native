export type DashboardSummary = {
  total_students: number;
  total_teachers: number;
  total_active_classes: number;
  today_income: number;
  today_expenses: number;
  today_gross: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_gross: number;
  pending_dues_count: number;
};

export type GrossRow = {
  class_course_id: number;
  class_name: string;
  income: number;
  expenses: number;
  gross: number;
};

export type GrossReport = {
  rows: GrossRow[];
  total_income: number;
  total_expenses: number;
  total_gross: number;
};
