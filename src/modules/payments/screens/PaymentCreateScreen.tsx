import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { AppButton } from '@/components/common/AppButton';
import { FormInput } from '@/components/form/FormInput';
import { DropdownSelect } from '@/components/form/DropdownSelect';
import { paymentsApi } from '@/services/paymentsApi';
import { enrollmentsApi } from '@/services/enrollmentsApi';
import { studentsApi } from '@/services/studentsApi';
import { classCoursesApi } from '@/services/classCoursesApi';
import type { Enrollment } from '@/types/enrollment';
import type { Student } from '@/types/student';
import type { ClassCourse } from '@/types/classCourse';
import type { PaymentMethod } from '@/types/common';
import { formatCurrency } from '@/utils/currency';
import { theme } from '@/theme';

const schema = z.object({
  enrollment_id: z.coerce.number().positive(),
  payment_date: z.string().min(1).default(new Date().toISOString().slice(0, 10)),
  amount: z.coerce.number().positive(),
  received_by: z.string().default('Admin'),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_wallet', 'other']).default('cash'),
  note: z.string().max(500).default('')
});

type Form = z.infer<typeof schema>;

const paymentMethods: PaymentMethod[] = ['cash', 'bank_transfer', 'mobile_wallet', 'other'];

export function PaymentCreateScreen() {
  const navigation = useNavigation<any>();
  const [enrollmentRows, setEnrollmentRows] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      enrollment_id: 0,
      payment_date: new Date().toISOString().slice(0, 10),
      amount: 0,
      received_by: 'Admin',
      payment_method: 'cash',
      note: ''
    }
  });

  const selectedMethod = watch('payment_method');
  const selectedEnrollment = watch('enrollment_id');

  const studentMap = useMemo(() => {
    const map = new Map<number, Student>();
    students.forEach((s) => map.set(Number(s.id), s));
    return map;
  }, [students]);

  const classMap = useMemo(() => {
    const map = new Map<number, ClassCourse>();
    classes.forEach((c) => map.set(Number(c.id), c));
    return map;
  }, [classes]);

  const selectedEnrollmentRow = useMemo(
    () => enrollmentRows.find((item) => Number(item.id) === Number(selectedEnrollment)),
    [enrollmentRows, selectedEnrollment]
  );

  const selectedStudent = selectedEnrollmentRow ? studentMap.get(Number(selectedEnrollmentRow.student_id)) : undefined;
  const selectedClass = selectedEnrollmentRow ? classMap.get(Number(selectedEnrollmentRow.class_course_id)) : undefined;

  const loadLookupTables = async () => {
    const [studentRows, classRows] = await Promise.all([
      studentsApi.list({ limit: 300 }),
      classCoursesApi.list({ limit: 300 })
    ]);
    setStudents(studentRows);
    setClasses(classRows);
  };

  const loadEnrollments = async () => {
    setLoadingRows(true);
    try {
      const rows = await enrollmentsApi.list({ limit: 1000 });
      setEnrollmentRows(
        rows.filter(
          (item) =>
            Number(item.remaining_amount) > 0 &&
            (item.payment_status === 'unpaid' || item.payment_status === 'partial')
        )
      );
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    loadLookupTables();
    loadEnrollments();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedEnrollmentRow) {
      Alert.alert('Invalid Enrollment', 'Please choose a valid enrollment with remaining due.');
      return;
    }

    if (values.amount > Number(selectedEnrollmentRow.remaining_amount || 0)) {
      Alert.alert('Invalid Amount', 'Payment amount cannot exceed the remaining balance.');
      return;
    }

    try {
      const result = await paymentsApi.create({
        enrollment_id: values.enrollment_id,
        payment_date: values.payment_date,
        payment_method: values.payment_method,
        amount: values.amount,
        received_by: values.received_by,
        note: values.note
      });
      const receipt = result.receipt as { receipt_no?: string };
      Alert.alert('Payment Saved', `Receipt ${receipt?.receipt_no || ''}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Payment Failed', (error as Error).message);
    }
  });

  return (
    <ScreenContainer>
      <PageHeader title="Record Payment" subtitle="Choose enrollment from dropdown and verify details before saving." />
      <View style={styles.formCard}>
        <DropdownSelect
          label="Enrollment"
          placeholder={loadingRows ? 'Loading enrollments...' : 'Select enrollment'}
          value={selectedEnrollment > 0 ? selectedEnrollment : undefined}
          options={enrollmentRows.map((item) => {
            const student = studentMap.get(Number(item.student_id));
            const classInfo = classMap.get(Number(item.class_course_id));
            return {
              value: Number(item.id),
              label: `${item.enrollment_code} • ${item.student_name || student?.full_name || `Student #${item.student_id}`}`,
              description: `${item.class_name || classInfo?.class_name || `Class #${item.class_course_id}`} • Remaining ${formatCurrency(item.remaining_amount)}`
            };
          })}
          onSelect={(value) => {
            const id = Number(value);
            const found = enrollmentRows.find((item) => Number(item.id) === id);
            setValue('enrollment_id', id, { shouldValidate: true });
            if (found) {
              setValue('amount', Number(found.remaining_amount || 0), { shouldValidate: true });
            }
          }}
          helperText={errors.enrollment_id?.message}
          disabled={loadingRows}
        />

        {!loadingRows && !enrollmentRows.length ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>No Due Enrollment</Text>
            <Text style={styles.infoText}>All enrollments are fully paid or no enrollment is available.</Text>
          </View>
        ) : null}

        {selectedEnrollmentRow ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Enrollment Info</Text>
            <Text style={styles.infoText}>{selectedEnrollmentRow.enrollment_code} • {selectedEnrollmentRow.payment_status.toUpperCase()}</Text>
            <Text style={styles.infoText}>Student: {selectedStudent?.full_name || '-'} / Guardian: {selectedStudent?.guardian_name || '-'}</Text>
            <Text style={styles.infoText}>Class: {selectedClass?.class_name || '-'} • {selectedClass?.course_name || '-'}</Text>
            <Text style={styles.infoText}>
              Final {formatCurrency(selectedEnrollmentRow.final_fee)} • Paid {formatCurrency(selectedEnrollmentRow.paid_amount)} • Remaining {formatCurrency(selectedEnrollmentRow.remaining_amount)}
            </Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="payment_date"
          render={({ field: { value, onChange } }) => (
            <FormInput
              label="Payment Date (YYYY-MM-DD)"
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange } }) => (
            <FormInput label="Amount" value={String(value)} onChangeText={onChange} error={errors.amount?.message} keyboardType="numeric" />
          )}
        />

        <Controller
          control={control}
          name="received_by"
          render={({ field: { value, onChange } }) => <FormInput label="Received By" value={value} onChangeText={onChange} />}
        />

        <Controller
          control={control}
          name="note"
          render={({ field: { value, onChange } }) => <FormInput label="Note" value={value} onChangeText={onChange} />}
        />

        <DropdownSelect
          label="Payment Method"
          value={selectedMethod}
          options={paymentMethods.map((method) => ({ value: method, label: method, description: 'Select payment channel' }))}
          onSelect={(value) => setValue('payment_method', value as PaymentMethod, { shouldValidate: true })}
        />

        <AppButton label={isSubmitting ? 'Saving...' : 'Save Payment'} onPress={onSubmit} disabled={isSubmitting} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.md
  },
  infoCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.sm,
    gap: theme.spacing.xxs
  },
  infoTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.text
  }
});
