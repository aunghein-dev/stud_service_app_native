import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Enrollments: { focusEnrollmentCode?: string } | undefined;
  Payments: { focusReceiptNo?: string } | undefined;
  More: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Teachers: undefined;
  Classes: { presetStatus?: 'planned' | 'open' | 'running' | 'completed' | 'closed'; title?: string } | undefined;
  Expenses: undefined;
  Receipts: undefined;
  Reports: undefined;
  StudentCreate: undefined;
  EnrollmentCreate: undefined;
  PaymentCreate: undefined;
  ReceiptDetail: { key: string };
  ReceiptPrintPreview: { key: string };
  Settings: undefined;
};
