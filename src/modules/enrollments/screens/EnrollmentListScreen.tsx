import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
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
import { useEnrollmentStore } from '@/store/enrollmentStore';
import { studentsApi } from '@/services/studentsApi';
import { classCoursesApi } from '@/services/classCoursesApi';
import type { Student } from '@/types/student';
import type { ClassCourse } from '@/types/classCourse';
import type { Enrollment } from '@/types/enrollment';
import { formatCurrency } from '@/utils/currency';
import { theme } from '@/theme';

const PAGE_SIZE = 20;

const emptyEditForm = {
  discount_amount: '0',
  note: ''
};

export function EnrollmentListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [offset, setOffset] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyEditForm);
  const { enrollments, loading, error, fetchEnrollments, updateEnrollment, deleteEnrollment } = useEnrollmentStore();

  const studentMap = useMemo(() => {
    const map = new Map<number, Student>();
    students.forEach((item) => map.set(Number(item.id), item));
    return map;
  }, [students]);

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
    await fetchEnrollments({
      q,
      date_from: date_from || undefined,
      date_to: date_to || undefined,
      limit: PAGE_SIZE,
      offset: nextOffset
    });
  };

  const loadLookups = async () => {
    setLookupLoading(true);
    try {
      const [studentRows, classRows] = await Promise.all([
        studentsApi.list({ limit: 1000 }),
        classCoursesApi.list({ limit: 1000 })
      ]);
      setStudents(studentRows);
      setClasses(classRows);
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
    const focusCode = (route.params?.focusEnrollmentCode || '').trim();
    if (!focusCode) {
      return;
    }
    setKeyword(focusCode);
    setOffset(0);
    void load({ q: focusCode, nextOffset: 0 });
  }, [route.params?.focusEnrollmentCode]);

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

  const onEdit = (item: Enrollment) => {
    setShowEdit(true);
    setEditingId(Number(item.id));
    setForm({
      discount_amount: String(item.discount_amount),
      note: item.note
    });
  };

  const save = async () => {
    if (!editingId) {
      return;
    }

    const discount = Number(form.discount_amount || 0);
    if (Number.isNaN(discount) || discount < 0) {
      Alert.alert('Invalid Discount', 'Discount must be a non-negative number.');
      return;
    }

    setSubmitting(true);
    try {
      await updateEnrollment(editingId, {
        discount_amount: discount,
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
    Alert.alert('Delete Enrollment', 'This will remove linked payments/receipts for this enrollment. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEnrollment(id);
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
        title="Enrollments"
        subtitle="Search, filter, paginate, and manage enrollment records."
        actionLabel="New"
        onActionPress={() => navigation.navigate('EnrollmentCreate')}
      />

      <HeaderAutoHideSection style={styles.topControls}>
        <SearchFilterBar
          value={keyword}
          onChangeText={setKeyword}
          onApply={() => {
            setOffset(0);
            load({ q: keyword, nextOffset: 0 });
          }}
          placeholder="Student, guardian, class, enrollment code"
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
          <Text style={styles.formTitle}>Edit Enrollment</Text>
          <FormInput
            label="Discount"
            value={form.discount_amount}
            onChangeText={(discount_amount) => setForm((state) => ({ ...state, discount_amount }))}
            keyboardType="numeric"
          />
          <FormInput
            label="Note"
            value={form.note}
            onChangeText={(note) => setForm((state) => ({ ...state, note }))}
          />
          <View style={styles.actionRow}>
            <AppButton
              label={submitting ? 'Saving...' : 'Update Enrollment'}
              onPress={save}
              disabled={submitting}
            />
            <AppButton label="Cancel" variant="ghost" onPress={resetEdit} />
          </View>
        </View>
      ) : null}

      {!isFormMode && (loading || lookupLoading) ? <LoadingState label="Loading enrollments..." /> : null}
      {!isFormMode && error ? <EmptyState title="Enrollment error" description={error} /> : null}
      {!isFormMode && !loading && !error && !enrollments.length ? (
        <EmptyState title="No enrollments" description="Enroll students to classes to populate this module." />
      ) : null}

      {!isFormMode ? (
        <HeaderAwareFlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={enrollments}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const student = studentMap.get(Number(item.student_id));
            const classInfo = classMap.get(Number(item.class_course_id));
            const studentName = item.student_name || student?.full_name || `Student #${item.student_id}`;
            const guardian = item.guardian_name || student?.guardian_name;
            const className = item.class_name || classInfo?.class_name || `Class #${item.class_course_id}`;
            const courseName = item.course_name || classInfo?.course_name;

            return (
              <View style={styles.card}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>#{item.enrollment_code}</Text>
                  <Text style={[styles.status, item.payment_status === 'paid' && styles.statusPaid]}>
                    {item.payment_status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.meta}>{studentName}{guardian ? ` • ${guardian}` : ''}</Text>
                <Text style={styles.meta}>{className}{courseName ? ` • ${courseName}` : ''}</Text>
                <Text style={styles.metaSecondary}>Remaining {formatCurrency(item.remaining_amount)}</Text>
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
          currentCount={enrollments.length}
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
  status: {
    ...theme.typography.caption,
    color: theme.colors.warning
  },
  statusPaid: {
    color: theme.colors.success
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
