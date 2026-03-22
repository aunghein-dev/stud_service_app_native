import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { AppButton } from '@/components/common/AppButton';
import { FormInput } from '@/components/form/FormInput';
import { DropdownSelect } from '@/components/form/DropdownSelect';
import { useEnrollmentStore } from '@/store/enrollmentStore';
import { studentsApi } from '@/services/studentsApi';
import { classCoursesApi } from '@/services/classCoursesApi';
import type { Student } from '@/types/student';
import type { ClassCourse, OptionalFeeItem } from '@/types/classCourse';
import type { PaymentMethod } from '@/types/common';
import { formatCurrency } from '@/utils/currency';
import { theme } from '@/theme';

const schema = z.object({
  student_id: z.coerce.number().int().positive(),
  class_course_id: z.coerce.number().int().positive(),
  enrollment_date: z.string().min(1).default(new Date().toISOString().slice(0, 10)),
  discount_amount: z.coerce.number().min(0).default(0),
  initial_payment: z.coerce.number().min(0).default(0),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_wallet', 'other']).default('cash'),
  received_by: z.string().default('Admin'),
  note: z.string().max(500).default('')
});

type Form = z.infer<typeof schema>;

type SelectedOptionalItem = {
  id: number;
  item_name: string;
  amount: number;
  quantity: number;
  total: number;
};

const paymentMethods: PaymentMethod[] = ['cash', 'bank_transfer', 'mobile_wallet', 'other'];

export function EnrollmentCreateScreen() {
  const navigation = useNavigation<any>();
  const { createEnrollment } = useEnrollmentStore();

  const [studentOptions, setStudentOptions] = useState<Student[]>([]);
  const [classOptions, setClassOptions] = useState<ClassCourse[]>([]);
  const [optionalFees, setOptionalFees] = useState<OptionalFeeItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingOptionalFees, setLoadingOptionalFees] = useState(false);
  const [selectedOptionalQuantities, setSelectedOptionalQuantities] = useState<Record<number, number>>({});

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      student_id: 0,
      class_course_id: 0,
      enrollment_date: new Date().toISOString().slice(0, 10),
      discount_amount: 0,
      initial_payment: 0,
      payment_method: 'cash',
      received_by: 'Admin',
      note: ''
    }
  });

  const studentId = watch('student_id');
  const classId = watch('class_course_id');
  const selectedPaymentMethod = watch('payment_method');
  const discountAmount = Number(watch('discount_amount') || 0);

  const selectedStudent = useMemo(
    () => studentOptions.find((item) => Number(item.id) === Number(studentId)),
    [studentOptions, studentId]
  );

  const selectedClass = useMemo(
    () => classOptions.find((item) => Number(item.id) === Number(classId)),
    [classOptions, classId]
  );

  const selectedOptionalItems = useMemo<SelectedOptionalItem[]>(() => {
    return optionalFees
      .filter((item) => Boolean(selectedOptionalQuantities[Number(item.id)]))
      .map((item) => {
        const quantity = Math.max(Number(selectedOptionalQuantities[Number(item.id)] || 1), 1);
        return {
          id: Number(item.id),
          item_name: item.item_name,
          amount: item.default_amount,
          quantity,
          total: item.default_amount * quantity
        };
      });
  }, [optionalFees, selectedOptionalQuantities]);

  const optionalTotal = useMemo(
    () => selectedOptionalItems.reduce((sum, item) => sum + item.total, 0),
    [selectedOptionalItems]
  );

  const baseFeeTotal = useMemo(() => {
    if (!selectedClass) {
      return 0;
    }

    return (
      Number(selectedClass.base_course_fee || 0) +
      Number(selectedClass.registration_fee || 0) +
      Number(selectedClass.exam_fee || 0) +
      Number(selectedClass.certificate_fee || 0)
    );
  }, [selectedClass]);

  const estimatedFinalFee = useMemo(
    () => Math.max(baseFeeTotal + optionalTotal - discountAmount, 0),
    [baseFeeTotal, optionalTotal, discountAmount]
  );

  const loadLookups = async () => {
    setLoadingLookups(true);
    try {
      const [students, classes] = await Promise.all([
        studentsApi.list({ limit: 300 }),
        classCoursesApi.list({ limit: 300 })
      ]);
      setStudentOptions(students);
      setClassOptions(classes);
    } catch (error) {
      Alert.alert('Lookup Error', (error as Error).message);
    } finally {
      setLoadingLookups(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    const loadOptionalFees = async () => {
      if (!classId || Number(classId) <= 0) {
        setOptionalFees([]);
        setSelectedOptionalQuantities({});
        return;
      }

      setLoadingOptionalFees(true);
      try {
        const items = await classCoursesApi.listOptionalFees(Number(classId));
        setOptionalFees(items.filter((item) => item.is_active));
        setSelectedOptionalQuantities({});
      } catch (error) {
        setOptionalFees([]);
        setSelectedOptionalQuantities({});
        Alert.alert('Optional Fees', (error as Error).message);
      } finally {
        setLoadingOptionalFees(false);
      }
    };

    loadOptionalFees();
  }, [classId]);

  const toggleOptionalFee = (item: OptionalFeeItem) => {
    const id = Number(item.id);
    setSelectedOptionalQuantities((current) => {
      if (current[id]) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: 1 };
    });
  };

  const adjustOptionalQuantity = (id: number, delta: number) => {
    setSelectedOptionalQuantities((current) => {
      const next = Math.max((current[id] || 1) + delta, 1);
      return { ...current, [id]: next };
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    if (Number(values.initial_payment || 0) > estimatedFinalFee) {
      Alert.alert('Invalid Initial Payment', 'Initial payment cannot exceed the estimated final fee.');
      return;
    }

    try {
      const result = await createEnrollment({
        student_id: values.student_id,
        class_course_id: values.class_course_id,
        enrollment_date: values.enrollment_date,
        discount_amount: values.discount_amount,
        optional_items: selectedOptionalItems.map((item) => ({
          optional_fee_item_id: item.id,
          item_name: item.item_name,
          amount: item.amount,
          quantity: item.quantity
        })),
        initial_payment: values.initial_payment,
        payment_method: values.payment_method,
        received_by: values.received_by,
        note: values.note,
        allow_duplicate: false
      });

      Alert.alert('Enrollment Created', `Code: ${result.enrollment.enrollment_code}`);
      navigation.goBack();
    } catch (error) {
      const message = (error as Error).message || 'Unable to create enrollment.';
      if (message.toLowerCase().includes('already enrolled')) {
        Alert.alert('Duplicate Enrollment', 'This student is already enrolled in the selected class.');
        return;
      }
      Alert.alert('Enrollment Failed', message);
    }
  });

  return (
    <ScreenContainer>
      <PageHeader title="New Enrollment" subtitle="Select student, class, and extra fees with a live fee summary before saving." />
      <View style={styles.formCard}>
        <DropdownSelect
          label="Student"
          placeholder={loadingLookups ? 'Loading students...' : 'Select student'}
          value={studentId > 0 ? studentId : undefined}
          options={studentOptions.map((item) => ({
            value: Number(item.id),
            label: `${item.full_name} (${item.student_code})`,
            description: `${item.guardian_name || '-'} • ${item.phone}`
          }))}
          onSelect={(value) => setValue('student_id', Number(value), { shouldValidate: true })}
          helperText={errors.student_id?.message}
          disabled={loadingLookups}
        />

        <DropdownSelect
          label="Class / Course"
          placeholder={loadingLookups ? 'Loading classes...' : 'Select class'}
          value={classId > 0 ? classId : undefined}
          options={classOptions.map((item) => ({
            value: Number(item.id),
            label: `${item.class_name} (${item.course_name})`,
            description: `${item.status.toUpperCase()} • Base ${formatCurrency(item.base_course_fee)}`
          }))}
          onSelect={(value) => setValue('class_course_id', Number(value), { shouldValidate: true })}
          helperText={errors.class_course_id?.message}
          disabled={loadingLookups}
        />

        {selectedStudent ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Student Info</Text>
            <Text style={styles.infoText}>
              {selectedStudent.full_name} • {selectedStudent.student_code}
            </Text>
            <Text style={styles.infoText}>
              Guardian: {selectedStudent.guardian_name || '-'} ({selectedStudent.guardian_phone || '-'})
            </Text>
            <Text style={styles.infoText}>Phone: {selectedStudent.phone}</Text>
          </View>
        ) : null}

        {selectedClass ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Class Fee Info</Text>
            <Text style={styles.infoText}>
              {selectedClass.class_name} • {selectedClass.course_name}
            </Text>
            <Text style={styles.infoText}>Base: {formatCurrency(selectedClass.base_course_fee)}</Text>
            <Text style={styles.infoText}>Registration: {formatCurrency(selectedClass.registration_fee)}</Text>
            <Text style={styles.infoText}>Exam: {formatCurrency(selectedClass.exam_fee)}</Text>
            <Text style={styles.infoText}>Certificate: {formatCurrency(selectedClass.certificate_fee)}</Text>
          </View>
        ) : null}

        {selectedClass ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Extra Charges</Text>
            {loadingOptionalFees ? <Text style={styles.infoText}>Loading optional fees...</Text> : null}
            {!loadingOptionalFees && !optionalFees.length ? <Text style={styles.infoText}>No optional fee items configured.</Text> : null}

            {optionalFees.map((item) => {
              const id = Number(item.id);
              const active = Boolean(selectedOptionalQuantities[id]);
              return (
                <View key={id} style={styles.optionalRowWrap}>
                  <Pressable
                    style={[styles.optionalRow, active && styles.optionalRowActive]}
                    onPress={() => toggleOptionalFee(item)}
                  >
                    <View style={styles.optionalCopy}>
                      <Text style={[styles.optionalName, active && styles.optionalNameActive]}>{item.item_name}</Text>
                      <Text style={styles.optionalMeta}>
                        {item.is_optional ? 'Optional add-on' : 'Required add-on'}
                      </Text>
                    </View>
                    <View style={styles.optionalPriceWrap}>
                      <Text style={styles.optionalAmount}>{formatCurrency(item.default_amount)}</Text>
                      <Text style={[styles.optionalBadge, active && styles.optionalBadgeActive]}>
                        {active ? 'Selected' : 'Tap to add'}
                      </Text>
                    </View>
                  </Pressable>

                  {active ? (
                    <View style={styles.quantityCard}>
                      <Text style={styles.quantityLabel}>Quantity</Text>
                      <View style={styles.quantityControls}>
                        <Pressable style={styles.quantityButton} onPress={() => adjustOptionalQuantity(id, -1)}>
                          <Text style={styles.quantityButtonText}>-</Text>
                        </Pressable>
                        <Text style={styles.quantityValue}>{selectedOptionalQuantities[id]}</Text>
                        <Pressable style={styles.quantityButton} onPress={() => adjustOptionalQuantity(id, 1)}>
                          <Text style={styles.quantityButtonText}>+</Text>
                        </Pressable>
                      </View>
                      <Text style={styles.quantityTotal}>
                        Total: {formatCurrency(item.default_amount * selectedOptionalQuantities[id])}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}

            {selectedOptionalItems.length ? (
              <View style={styles.selectedWrap}>
                {selectedOptionalItems.map((item) => (
                  <View key={item.id} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>
                      {item.item_name} x{item.quantity}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={styles.infoText}>Optional Total: {formatCurrency(optionalTotal)}</Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="enrollment_date"
          render={({ field: { value, onChange } }) => (
            <FormInput label="Enrollment Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
          )}
        />

        <Controller
          control={control}
          name="discount_amount"
          render={({ field: { value, onChange } }) => (
            <FormInput
              label="Discount"
              value={String(value)}
              onChangeText={onChange}
              error={errors.discount_amount?.message}
              keyboardType="numeric"
            />
          )}
        />

        <Controller
          control={control}
          name="initial_payment"
          render={({ field: { value, onChange } }) => (
            <FormInput
              label="Initial Payment"
              value={String(value)}
              onChangeText={onChange}
              error={errors.initial_payment?.message}
              keyboardType="numeric"
            />
          )}
        />

        <Controller
          control={control}
          name="received_by"
          render={({ field: { value, onChange } }) => <FormInput label="Received By" value={value} onChangeText={onChange} />}
        />

        <DropdownSelect
          label="Payment Method"
          value={selectedPaymentMethod}
          options={paymentMethods.map((method) => ({
            value: method,
            label: method,
            description: 'Receipt payment channel'
          }))}
          onSelect={(value) => setValue('payment_method', value as PaymentMethod, { shouldValidate: true })}
        />

        <Controller
          control={control}
          name="note"
          render={({ field: { value, onChange } }) => <FormInput label="Note" value={value} onChangeText={onChange} multiline />}
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Estimated Final</Text>
          <Text style={styles.infoText}>
            Class Total: {formatCurrency(baseFeeTotal)} • Optional: {formatCurrency(optionalTotal)}
          </Text>
          <Text style={styles.infoText}>Discount: {formatCurrency(discountAmount)}</Text>
          <Text style={styles.infoText}>Estimated Final Fee: {formatCurrency(estimatedFinalFee)}</Text>
        </View>

        <AppButton label={isSubmitting ? 'Saving...' : 'Create Enrollment'} onPress={onSubmit} disabled={isSubmitting} />
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
  },
  optionalRowWrap: {
    gap: theme.spacing.xs
  },
  optionalRow: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  optionalRowActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  optionalCopy: {
    flex: 1,
    gap: theme.spacing.xxs
  },
  optionalName: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text,
    flex: 1
  },
  optionalNameActive: {
    color: theme.colors.primary
  },
  optionalMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  optionalPriceWrap: {
    alignItems: 'flex-end',
    gap: theme.spacing.xxs
  },
  optionalAmount: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  optionalBadge: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  },
  optionalBadgeActive: {
    color: theme.colors.primary
  },
  quantityCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  quantityLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted
  },
  quantityButtonText: {
    ...theme.typography.heading,
    color: theme.colors.primary
  },
  quantityValue: {
    ...theme.typography.heading,
    color: theme.colors.text,
    minWidth: 24,
    textAlign: 'center'
  },
  quantityTotal: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  selectedChip: {
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  selectedChipText: {
    ...theme.typography.caption,
    color: theme.colors.text
  }
});
