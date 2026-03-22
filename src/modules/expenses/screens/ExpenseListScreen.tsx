import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AppButton } from '@/components/common/AppButton';
import { PaginationControls } from '@/components/common/PaginationControls';
import { useHeaderAutoHideListScroll } from '@/components/common/headerMotion';
import { FormInput } from '@/components/form/FormInput';
import { DropdownSelect } from '@/components/form/DropdownSelect';
import { expensesApi } from '@/services/expensesApi';
import { teachersApi } from '@/services/teachersApi';
import { classCoursesApi } from '@/services/classCoursesApi';
import type { Expense } from '@/types/expense';
import type { Teacher } from '@/types/teacher';
import type { ClassCourse } from '@/types/classCourse';
import type { ExpenseType } from '@/types/common';
import { formatCurrency } from '@/utils/currency';
import { theme } from '@/theme';

const expenseTypes: ExpenseType[] = [
  'teacher_fee',
  'books',
  'uniform',
  'shoes',
  'stationery',
  'rent',
  'utilities',
  'marketing',
  'misc'
];

const paymentMethods = ['cash', 'bank_transfer', 'mobile_wallet', 'other'];
const PAGE_SIZE = 20;

const emptyForm = {
  expense_date: new Date().toISOString().slice(0, 10),
  expense_type: 'misc' as ExpenseType,
  teacher_id: undefined as number | undefined,
  class_course_id: undefined as number | undefined,
  amount: '0',
  description: '',
  payment_method: 'cash',
  reference_no: ''
};

export function ExpenseListScreen() {
  const headerScroll = useHeaderAutoHideListScroll();
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<Expense[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const teacherMap = useMemo(() => {
    const map = new Map<number, Teacher>();
    teachers.forEach((item) => map.set(Number(item.id), item));
    return map;
  }, [teachers]);

  const classMap = useMemo(() => {
    const map = new Map<number, ClassCourse>();
    classes.forEach((item) => map.set(Number(item.id), item));
    return map;
  }, [classes]);

  const load = async (q = keyword, date_from = dateFrom, date_to = dateTo, nextOffset = offset) => {
    setLoading(true);
    setError(undefined);
    try {
      setItems(
        await expensesApi.list({
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
      const [teacherRows, classRows] = await Promise.all([
        teachersApi.list({ limit: 200 }),
        classCoursesApi.list({ limit: 200 })
      ]);
      setTeachers(teacherRows);
      setClasses(classRows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    load('', '', '', 0);
    loadLookups();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      loadLookups();
    }, [keyword, dateFrom, dateTo, offset])
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const onCreate = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const onEdit = (item: Expense) => {
    setShowForm(true);
    setEditingId(Number(item.id));
    setForm({
      expense_date: item.expense_date,
      expense_type: item.expense_type,
      teacher_id: item.teacher_id ? Number(item.teacher_id) : undefined,
      class_course_id: item.class_course_id ? Number(item.class_course_id) : undefined,
      amount: String(item.amount),
      description: item.description,
      payment_method: item.payment_method || 'cash',
      reference_no: item.reference_no
    });
  };

  const save = async () => {
    const amount = Number(form.amount || 0);
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Amount must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        expense_date: form.expense_date,
        expense_type: form.expense_type,
        teacher_id: form.teacher_id,
        class_course_id: form.class_course_id,
        amount,
        description: form.description,
        payment_method: form.payment_method,
        reference_no: form.reference_no
      };

      if (editingId) {
        await expensesApi.update(editingId, payload);
      } else {
        await expensesApi.create(payload);
      }

      await load();
      await loadLookups();
      resetForm();
    } catch (error) {
      Alert.alert('Save failed', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = (id: number) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await expensesApi.remove(id);
            await load();
            await loadLookups();
          } catch (error) {
            Alert.alert('Delete failed', (error as Error).message);
          }
        }
      }
    ]);
  };

  const isFormMode = showForm;

  return (
    <ScreenContainer scroll={isFormMode} contentStyle={styles.container}>
      <PageHeader
        title="Expenses"
        subtitle="Track and maintain operation costs with complete CRUD controls."
        actionLabel="New"
        onActionPress={onCreate}
      />

      <SearchFilterBar
        value={keyword}
        onChangeText={setKeyword}
        onApply={() => {
          setOffset(0);
          load(keyword, dateFrom, dateTo, 0);
        }}
        placeholder="Expense type, description, reference"
      />

      <View style={styles.dateFilterRow}>
        <FormInput label="Date From" value={dateFrom} onChangeText={setDateFrom} placeholder="YYYY-MM-DD" />
        <FormInput label="Date To" value={dateTo} onChangeText={setDateTo} placeholder="YYYY-MM-DD" />
      </View>

      <View style={styles.filterActions}>
        <AppButton
          label="Apply Date"
          variant="secondary"
          size="compact"
          fullWidth={false}
          onPress={() => {
            setOffset(0);
            load(keyword, dateFrom, dateTo, 0);
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
            load(keyword, '', '', 0);
          }}
        />
      </View>

      {showForm ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingId ? 'Edit Expense' : 'New Expense'}</Text>
          <FormInput
            label="Expense Date (YYYY-MM-DD)"
            value={form.expense_date}
            onChangeText={(expense_date) => setForm((state) => ({ ...state, expense_date }))}
          />

          <View style={styles.chipWrap}>
            {expenseTypes.map((type) => (
              <Pressable
                key={type}
                style={[styles.chip, form.expense_type === type && styles.chipActive]}
                onPress={() => setForm((state) => ({ ...state, expense_type: type }))}
              >
                <Text style={[styles.chipText, form.expense_type === type && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>

          <DropdownSelect
            label="Teacher (Optional)"
            placeholder={lookupLoading ? 'Loading teachers...' : 'Select teacher'}
            value={form.teacher_id}
            options={teachers.map((item) => ({
              value: Number(item.id),
              label: item.teacher_name,
              description: item.teacher_code
            }))}
            onSelect={(value) => setForm((state) => ({ ...state, teacher_id: Number(value) }))}
            disabled={lookupLoading}
          />

          <DropdownSelect
            label="Class (Optional)"
            placeholder={lookupLoading ? 'Loading classes...' : 'Select class'}
            value={form.class_course_id}
            options={classes.map((item) => ({
              value: Number(item.id),
              label: item.class_name,
              description: `${item.course_name} • ${item.course_code}`
            }))}
            onSelect={(value) => setForm((state) => ({ ...state, class_course_id: Number(value) }))}
            disabled={lookupLoading}
          />

          <FormInput
            label="Amount"
            value={form.amount}
            onChangeText={(amount) => setForm((state) => ({ ...state, amount }))}
            keyboardType="numeric"
          />
          <FormInput
            label="Payment Method"
            value={form.payment_method}
            onChangeText={(payment_method) => setForm((state) => ({ ...state, payment_method }))}
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

          <FormInput
            label="Reference No"
            value={form.reference_no}
            onChangeText={(reference_no) => setForm((state) => ({ ...state, reference_no }))}
          />
          <FormInput
            label="Description"
            value={form.description}
            onChangeText={(description) => setForm((state) => ({ ...state, description }))}
          />

          <View style={styles.actionRow}>
            <AppButton
              label={submitting ? 'Saving...' : editingId ? 'Update Expense' : 'Create Expense'}
              onPress={save}
              disabled={submitting}
            />
            <AppButton label="Cancel" variant="ghost" onPress={resetForm} />
          </View>
        </View>
      ) : null}

      {!isFormMode && (loading || lookupLoading) ? <LoadingState label="Loading expenses..." /> : null}
      {!isFormMode && error ? <EmptyState title="Unable to load expenses" description={error} /> : null}
      {!isFormMode && !loading && !error && !items.length ? (
        <EmptyState title="No expenses" description="Track teacher fees and operational costs." />
      ) : null}

      {!isFormMode ? (
        <FlatList
          {...headerScroll}
          style={styles.list}
          data={items}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const teacher = item.teacher_id ? teacherMap.get(Number(item.teacher_id)) : undefined;
            const classInfo = item.class_course_id ? classMap.get(Number(item.class_course_id)) : undefined;

            return (
              <View style={styles.card}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{item.expense_type}</Text>
                  <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                </View>
                <Text style={styles.meta}>{item.expense_date} • {item.payment_method}</Text>
                <Text style={styles.metaSecondary}>Teacher: {teacher?.teacher_name || '-'}</Text>
                <Text style={styles.metaSecondary}>Class: {classInfo?.class_name || '-'}</Text>
                <Text style={styles.metaSecondary}>{item.description || 'No description'}</Text>
                <Text style={styles.metaSecondary}>Ref: {item.reference_no || '-'}</Text>
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
          currentCount={items.length}
          loading={loading || lookupLoading}
          onPrevious={() => {
            const nextOffset = Math.max(offset - PAGE_SIZE, 0);
            setOffset(nextOffset);
            load(keyword, dateFrom, dateTo, nextOffset);
          }}
          onNext={() => {
            const nextOffset = offset + PAGE_SIZE;
            setOffset(nextOffset);
            load(keyword, dateFrom, dateTo, nextOffset);
          }}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md
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
  dateFilterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  filterActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm
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
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
    ...theme.shadows.sm
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
    textTransform: 'capitalize'
  },
  amount: {
    ...theme.typography.subheading,
    color: theme.colors.danger
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
    marginTop: theme.spacing.xs
  }
});
