import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AppButton } from '@/components/common/AppButton';
import { PaginationControls } from '@/components/common/PaginationControls';
import { HeaderAwareFlatList } from '@/components/common/HeaderAwareFlatList';
import { HeaderAutoHideSection } from '@/components/common/HeaderAutoHideSection';
import { FormInput } from '@/components/form/FormInput';
import { paymentsApi } from '@/services/paymentsApi';
import { studentsApi } from '@/services/studentsApi';
import { enrollmentsApi } from '@/services/enrollmentsApi';
import { classCoursesApi } from '@/services/classCoursesApi';
import type { Payment } from '@/types/payment';
import type { Student } from '@/types/student';
import type { Enrollment } from '@/types/enrollment';
import type { ClassCourse } from '@/types/classCourse';
import type { PaymentMethod } from '@/types/common';
import { formatCurrency } from '@/utils/currency';
import { theme } from '@/theme';

const paymentMethods: PaymentMethod[] = ['cash', 'bank_transfer', 'mobile_wallet', 'other'];
const PAGE_SIZE = 20;

const emptyEditForm = {
  payment_date: new Date().toISOString().slice(0, 10),
  amount: '0',
  payment_method: 'cash' as PaymentMethod,
  received_by: 'Admin',
  note: ''
};

export function PaymentListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [offset, setOffset] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyEditForm);

  const studentMap = useMemo(() => {
    const map = new Map<number, Student>();
    students.forEach((item) => map.set(Number(item.id), item));
    return map;
  }, [students]);

  const enrollmentMap = useMemo(() => {
    const map = new Map<number, Enrollment>();
    enrollments.forEach((item) => map.set(Number(item.id), item));
    return map;
  }, [enrollments]);

  const classMap = useMemo(() => {
    const map = new Map<number, ClassCourse>();
    classes.forEach((item) => map.set(Number(item.id), item));
    return map;
  }, [classes]);

  const load = async ({
    q = keyword,
    date_from = dateFrom,
    date_to = dateTo,
    nextOffset = offset
  }: {
    q?: string;
    date_from?: string;
    date_to?: string;
    nextOffset?: number;
  } = {}) => {
    setLoading(true);
    setError(undefined);
    try {
      setPayments(
        await paymentsApi.list({
          q,
          date_from: date_from || undefined,
          date_to: date_to || undefined,
          limit: PAGE_SIZE,
          offset: nextOffset
        })
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    setLookupLoading(true);
    try {
      const [studentRows, enrollmentRows, classRows] = await Promise.all([
        studentsApi.list({ limit: 1000 }),
        enrollmentsApi.list({ limit: 1000 }),
        classCoursesApi.list({ limit: 1000 })
      ]);
      setStudents(studentRows);
      setEnrollments(enrollmentRows);
      setClasses(classRows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLookupLoading(false);
    }
  };

  const refreshCurrent = useCallback(async () => {
    await Promise.all([load(), loadLookups()]);
  }, [keyword, dateFrom, dateTo, offset]);

  useEffect(() => {
    refreshCurrent();
  }, []);

  useEffect(() => {
    const focusReceiptNo = (route.params?.focusReceiptNo || '').trim();
    if (!focusReceiptNo) {
      return;
    }
    setKeyword(focusReceiptNo);
    setOffset(0);
    void load({ q: focusReceiptNo, nextOffset: 0 });
  }, [route.params?.focusReceiptNo]);

  useFocusEffect(
    useCallback(() => {
      refreshCurrent();
    }, [refreshCurrent])
  );

  const resetEdit = () => {
    setShowEdit(false);
    setEditingId(null);
    setForm(emptyEditForm);
  };

  const onEdit = (item: Payment) => {
    setShowEdit(true);
    setEditingId(Number(item.id));
    setForm({
      payment_date: item.payment_date,
      amount: String(item.amount),
      payment_method: item.payment_method,
      received_by: item.received_by || 'Admin',
      note: item.note || ''
    });
  };

  const save = async () => {
    if (!editingId) {
      return;
    }

    const amount = Number(form.amount || 0);
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Amount must be greater than zero.');
      return;
    }

    const currentPayment = payments.find((item) => Number(item.id) === editingId);
    const linkedEnrollment = currentPayment
      ? enrollmentMap.get(Number(currentPayment.enrollment_id))
      : undefined;

    if (currentPayment && linkedEnrollment) {
      const maxAllowed = Number(linkedEnrollment.final_fee) - (Number(linkedEnrollment.paid_amount) - Number(currentPayment.amount));
      if (amount > maxAllowed) {
        Alert.alert('Invalid Amount', 'Updated amount cannot exceed remaining enrollment balance.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await paymentsApi.update(editingId, {
        payment_date: form.payment_date,
        amount,
        payment_method: form.payment_method,
        received_by: form.received_by,
        note: form.note
      });
      await refreshCurrent();
      resetEdit();
    } catch (e) {
      Alert.alert('Update failed', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = (id: number) => {
    Alert.alert('Delete Payment', 'This will also remove the linked receipt entry. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await paymentsApi.remove(id);
            await refreshCurrent();
          } catch (error) {
            Alert.alert('Delete failed', (error as Error).message);
          }
        }
      }
    ]);
  };

  const isFormMode = showEdit;

  return (
    <ScreenContainer scroll={isFormMode} contentStyle={styles.container}>
      <PageHeader
        title="Payments"
        subtitle="Search, filter, paginate, and manage payment records."
        actionLabel="New"
        onActionPress={() => navigation.navigate('PaymentCreate')}
      />

      <HeaderAutoHideSection style={styles.topControls}>
        <SearchFilterBar
          value={keyword}
          onChangeText={setKeyword}
          onApply={() => {
            setOffset(0);
            load({ q: keyword, nextOffset: 0 });
          }}
          placeholder="Student, guardian, receipt, enrollment code"
        />

        <View style={styles.dateFilterRow}>
          <FormInput
            label="Date From"
            value={dateFrom}
            onChangeText={setDateFrom}
            placeholder="From YYYY-MM-DD"
            compact
            hideLabel
            style={styles.dateField}
          />
          <FormInput
            label="Date To"
            value={dateTo}
            onChangeText={setDateTo}
            placeholder="To YYYY-MM-DD"
            compact
            hideLabel
            style={styles.dateField}
          />
        </View>

        <View style={styles.filterActions}>
          <AppButton
            label="Apply Date"
            variant="secondary"
            size="compact"
            fullWidth={false}
            onPress={() => {
              setOffset(0);
              load({ date_from: dateFrom, date_to: dateTo, nextOffset: 0 });
            }}
          />
          <AppButton
            label="Clear"
            variant="ghost"
            size="compact"
            fullWidth={false}
            onPress={() => {
              setDateFrom('');
              setDateTo('');
              setOffset(0);
              load({ date_from: '', date_to: '', nextOffset: 0 });
            }}
          />
        </View>
      </HeaderAutoHideSection>

      {showEdit ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Edit Payment</Text>
          <FormInput
            label="Payment Date (YYYY-MM-DD)"
            value={form.payment_date}
            onChangeText={(payment_date) => setForm((state) => ({ ...state, payment_date }))}
          />
          <FormInput
            label="Amount"
            value={form.amount}
            onChangeText={(amount) => setForm((state) => ({ ...state, amount }))}
            keyboardType="numeric"
          />
          <FormInput
            label="Received By"
            value={form.received_by}
            onChangeText={(received_by) => setForm((state) => ({ ...state, received_by }))}
          />
          <FormInput
            label="Note"
            value={form.note}
            onChangeText={(note) => setForm((state) => ({ ...state, note }))}
          />

          <View style={styles.chipWrap}>
            {paymentMethods.map((method) => (
              <Pressable
                key={method}
                style={[styles.chip, form.payment_method === method && styles.chipActive]}
                onPress={() => setForm((state) => ({ ...state, payment_method: method }))}
              >
                <Text style={[styles.chipText, form.payment_method === method && styles.chipTextActive]}>{method}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actionRow}>
            <AppButton
              label={submitting ? 'Saving...' : 'Update Payment'}
              onPress={save}
              disabled={submitting}
            />
            <AppButton label="Cancel" variant="ghost" onPress={resetEdit} />
          </View>
        </View>
      ) : null}

      {!isFormMode && (loading || lookupLoading) ? <LoadingState label="Loading payments..." /> : null}
      {!isFormMode && error ? <EmptyState title="Unable to load payments" description={error} /> : null}
      {!isFormMode && !loading && !error && !payments.length ? (
        <EmptyState title="No payments" description="Record payments to generate receipts and update dues." />
      ) : null}

      {!isFormMode ? (
        <HeaderAwareFlatList
          style={styles.list}
          data={payments}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const student = studentMap.get(Number(item.student_id));
            const enrollment = enrollmentMap.get(Number(item.enrollment_id));
            const classInfo = classMap.get(Number(item.class_course_id));
            const studentName = enrollment?.student_name || student?.full_name || `Student #${item.student_id}`;
            const guardian = enrollment?.guardian_name || student?.guardian_name;
            const enrollmentName = enrollment ? enrollment.enrollment_code : `Enrollment #${item.enrollment_id}`;
            const methodLabel = item.payment_method.replace(/_/g, ' ');
            const className = enrollment?.class_name || classInfo?.class_name;

            return (
              <View style={styles.card}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{item.receipt_no}</Text>
                  <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                </View>
                <Text style={styles.meta}>{studentName}{guardian ? ` • ${guardian}` : ''}</Text>
                <Text style={styles.meta}>{enrollmentName} • {item.payment_date}</Text>
                <Text style={styles.metaSecondary}>{className ? `${className} • ${methodLabel}` : methodLabel}</Text>
                <View style={styles.rowButtons}>
                  <AppButton label="Edit" size="compact" variant="ghost" onPress={() => onEdit(item)} />
                  <AppButton label="Delete" size="compact" variant="secondary" onPress={() => remove(Number(item.id))} />
                </View>
              </View>
            );
          }}
        />
      ) : null}

      {!isFormMode ? (
        <PaginationControls
          limit={PAGE_SIZE}
          offset={offset}
          currentCount={payments.length}
          loading={loading || lookupLoading}
          onPrevious={() => {
            const nextOffset = Math.max(offset - PAGE_SIZE, 0);
            setOffset(nextOffset);
            load({ nextOffset });
          }}
          onNext={() => {
            const nextOffset = offset + PAGE_SIZE;
            setOffset(nextOffset);
            load({ nextOffset });
          }}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm
  },
  topControls: {
    gap: theme.spacing.sm
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  dateField: {
    flex: 1
  },
  filterActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap'
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.md
  },
  formTitle: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceMuted
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  chipTextActive: {
    color: theme.colors.primary
  },
  actionRow: {
    gap: theme.spacing.sm
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingBottom: theme.spacing.lg
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  name: {
    ...theme.typography.subheading,
    color: theme.colors.text,
    flex: 1
  },
  amount: {
    ...theme.typography.subheading,
    color: theme.colors.primary
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  },
  metaSecondary: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  },
  rowButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxs
  }
});
