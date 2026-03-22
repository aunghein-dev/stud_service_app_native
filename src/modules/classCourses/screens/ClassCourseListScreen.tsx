import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AppButton } from '@/components/common/AppButton';
import { PaginationControls } from '@/components/common/PaginationControls';
import { useHeaderAutoHideListScroll } from '@/components/common/headerMotion';
import { FormInput } from '@/components/form/FormInput';
import { classCoursesApi } from '@/services/classCoursesApi';
import type { ClassCourse, OptionalFeeItem } from '@/types/classCourse';
import type { RootStackParamList } from '@/navigation/types';
import { formatCurrency } from '@/utils/currency';
import { theme } from '@/theme';

const categories: ClassCourse['category'][] = ['english_speaking', 'academic', 'exam_prep', 'other'];
const statuses: ClassCourse['status'][] = ['planned', 'open', 'running', 'completed', 'closed'];
type StatusFilter = 'all' | ClassCourse['status'];
const PAGE_SIZE = 20;

const defaultForm = {
  course_code: '',
  course_name: '',
  class_name: '',
  category: 'academic' as ClassCourse['category'],
  status: 'open' as ClassCourse['status'],
  room: '',
  max_students: '30',
  base_course_fee: '0',
  registration_fee: '0',
  exam_fee: '0',
  certificate_fee: '0',
  note: ''
};

type OptionalFeeDraft = {
  localId: string;
  id?: number;
  item_name: string;
  default_amount: string;
  is_optional: boolean;
  is_active: boolean;
};

function createOptionalDraft(item?: OptionalFeeItem): OptionalFeeDraft {
  return {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    id: item ? Number(item.id) : undefined,
    item_name: item?.item_name || '',
    default_amount: String(item?.default_amount || 0),
    is_optional: item?.is_optional ?? true,
    is_active: item?.is_active ?? true
  };
}

export function ClassCourseListScreen() {
  const headerScroll = useHeaderAutoHideListScroll();
  const route = useRoute<RouteProp<RootStackParamList, 'Classes'>>();
  const [keyword, setKeyword] = useState('');
  const [classes, setClasses] = useState<ClassCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(route.params?.presetStatus || 'all');
  const [offset, setOffset] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [optionalFees, setOptionalFees] = useState<OptionalFeeDraft[]>([]);
  const [loadingOptionalFees, setLoadingOptionalFees] = useState(false);

  const pageTitle = route.params?.title || 'Classes';

  const load = async (q?: string, status?: StatusFilter, nextOffset = offset) => {
    const activeQuery = typeof q === 'string' ? q : keyword;
    const activeStatus = status || statusFilter;

    setLoading(true);
    try {
      setClasses(
        await classCoursesApi.list({
          q: activeQuery,
          class_status: activeStatus === 'all' ? undefined : activeStatus,
          limit: PAGE_SIZE,
          offset: nextOffset
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('', route.params?.presetStatus || 'all', 0);
  }, []);

  useEffect(() => {
    if (route.params?.presetStatus) {
      setStatusFilter(route.params.presetStatus);
      setOffset(0);
      load(keyword, route.params.presetStatus, 0);
    }
  }, [route.params?.presetStatus]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [keyword, statusFilter, offset])
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
    setOptionalFees([]);
  };

  const onCreate = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(defaultForm);
    setOptionalFees([]);
  };

  const loadOptionalFeeDrafts = async (classId: number) => {
    setLoadingOptionalFees(true);
    try {
      const rows = await classCoursesApi.listOptionalFees(classId);
      setOptionalFees(rows.map((item) => createOptionalDraft(item)));
    } catch (error) {
      setOptionalFees([]);
      Alert.alert('Optional Charges', (error as Error).message);
    } finally {
      setLoadingOptionalFees(false);
    }
  };

  const onEdit = (item: ClassCourse) => {
    setShowForm(true);
    setEditingId(Number(item.id));
    setForm({
      course_code: item.course_code,
      course_name: item.course_name,
      class_name: item.class_name,
      category: item.category,
      status: item.status,
      room: item.room,
      max_students: String(item.max_students),
      base_course_fee: String(item.base_course_fee),
      registration_fee: String(item.registration_fee),
      exam_fee: String(item.exam_fee),
      certificate_fee: String(item.certificate_fee),
      note: item.note || ''
    });
    void loadOptionalFeeDrafts(Number(item.id));
  };

  const buildPayload = () => ({
    course_code: form.course_code,
    course_name: form.course_name,
    class_name: form.class_name,
    category: form.category,
    subject: '',
    level: '',
    start_date: '',
    end_date: '',
    schedule_text: '',
    days_of_week: [],
    time_start: '',
    time_end: '',
    room: form.room,
    assigned_teacher_id: undefined,
    max_students: Number(form.max_students || 0),
    status: form.status,
    base_course_fee: Number(form.base_course_fee || 0),
    registration_fee: Number(form.registration_fee || 0),
    exam_fee: Number(form.exam_fee || 0),
    certificate_fee: Number(form.certificate_fee || 0),
    note: form.note
  });

  const normalizeOptionalFees = () =>
    optionalFees
      .map((item) => ({
        ...item,
        item_name: item.item_name.trim(),
        amount: Number(item.default_amount || 0)
      }))
      .filter((item) => item.item_name && !Number.isNaN(item.amount) && item.amount >= 0);

  const syncOptionalFees = async (classCourseId: number) => {
    const normalized = normalizeOptionalFees();
    const existing = await classCoursesApi.listOptionalFees(classCourseId);
    const existingIds = new Set(existing.map((item) => Number(item.id)));
    const retainedIds = new Set<number>();

    await Promise.all(
      normalized.map(async (item) => {
        const payload = {
          item_name: item.item_name,
          default_amount: item.amount,
          is_optional: item.is_optional,
          is_active: item.is_active
        };

        if (item.id) {
          retainedIds.add(item.id);
          await classCoursesApi.updateOptionalFee(item.id, payload);
          return;
        }

        const created = await classCoursesApi.createOptionalFee(classCourseId, payload);
        retainedIds.add(Number(created.id));
      })
    );

    const removedIds = [...existingIds].filter((id) => !retainedIds.has(id));
    await Promise.all(removedIds.map((id) => classCoursesApi.removeOptionalFee(id)));
  };

  const save = async () => {
    if (!form.course_code.trim() || !form.course_name.trim() || !form.class_name.trim()) {
      Alert.alert('Missing Fields', 'Course code, course name, and class name are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await classCoursesApi.update(editingId, buildPayload());
        await syncOptionalFees(editingId);
      } else {
        const created = await classCoursesApi.create(buildPayload());
        await syncOptionalFees(Number(created.id));
      }
      await load();
      resetForm();
    } catch (error) {
      Alert.alert('Save failed', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = (id: number) => {
    Alert.alert('Delete Class', 'Delete will archive/close this class. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await classCoursesApi.remove(id);
            await load();
          } catch (error) {
            Alert.alert('Delete failed', (error as Error).message);
          }
        }
      }
    ]);
  };

  const activeCount = useMemo(() => classes.filter((item) => item.status === 'open' || item.status === 'running').length, [classes]);
  const defaultSlipFeeTotal = useMemo(
    () =>
      Number(form.base_course_fee || 0) +
      Number(form.registration_fee || 0) +
      Number(form.exam_fee || 0) +
      Number(form.certificate_fee || 0),
    [form.base_course_fee, form.registration_fee, form.exam_fee, form.certificate_fee]
  );
  const isFormMode = showForm;

  return (
    <ScreenContainer scroll={isFormMode} contentStyle={styles.container}>
      <PageHeader
        title={pageTitle}
        subtitle="Create, update, and close classes with status-based filtering for active operations."
        actionLabel="New"
        onActionPress={onCreate}
      />

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total</Text>
          <Text style={styles.metricValue}>{classes.length}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Active</Text>
          <Text style={styles.metricValue}>{activeCount}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Filter</Text>
          <Text style={styles.metricValue}>{statusFilter.toUpperCase()}</Text>
        </View>
      </View>

      <SearchFilterBar
        value={keyword}
        onChangeText={setKeyword}
        onApply={() => {
          setOffset(0);
          load(keyword, statusFilter, 0);
        }}
        placeholder="Class, course, code"
      />

      <View style={styles.chipGroup}>
        {(['all', ...statuses] as StatusFilter[]).map((status) => (
          <Pressable
            key={status}
            style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
            onPress={() => {
              setStatusFilter(status);
              setOffset(0);
              load(keyword, status, 0);
            }}
          >
            <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>{status}</Text>
          </Pressable>
        ))}
      </View>

      {showForm ? (
        <View style={styles.formCard}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Class Identity</Text>
            <FormInput
              label="Class Name"
              value={form.class_name}
              onChangeText={(class_name) => setForm((s) => ({ ...s, class_name }))}
              compact
            />
            <View style={styles.feeRow}>
              <FormInput
                label="Course Name"
                value={form.course_name}
                onChangeText={(course_name) => setForm((s) => ({ ...s, course_name }))}
                style={styles.feeInput}
                compact
              />
              <FormInput
                label="Course Code"
                value={form.course_code}
                onChangeText={(course_code) => setForm((s) => ({ ...s, course_code }))}
                style={styles.feeInput}
                compact
              />
            </View>
            <View style={styles.feeRow}>
              <FormInput
                label="Room"
                value={form.room}
                onChangeText={(room) => setForm((s) => ({ ...s, room }))}
                style={styles.feeInput}
                compact
              />
              <FormInput
                label="Max Students"
                value={form.max_students}
                onChangeText={(max_students) => setForm((s) => ({ ...s, max_students }))}
                keyboardType="numeric"
                style={styles.feeInput}
                compact
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Class Setup</Text>
            <Text style={styles.sectionHint}>Category</Text>
            <View style={styles.segmentWrap}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  style={[styles.segmentChip, form.category === category && styles.segmentChipActive]}
                  onPress={() => setForm((s) => ({ ...s, category }))}
                >
                  <Text style={[styles.segmentText, form.category === category && styles.segmentTextActive]}>{category}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.sectionHint}>Status</Text>
            <View style={styles.segmentWrap}>
              {statuses.map((status) => (
                <Pressable
                  key={status}
                  style={[styles.segmentChip, form.status === status && styles.segmentChipActive]}
                  onPress={() => setForm((s) => ({ ...s, status }))}
                >
                  <Text style={[styles.segmentText, form.status === status && styles.segmentTextActive]}>{status}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Receipt Fee Setup</Text>
            <FormInput
              label="Base Course Fee"
              value={form.base_course_fee}
              onChangeText={(base_course_fee) => setForm((s) => ({ ...s, base_course_fee }))}
              keyboardType="numeric"
              compact
            />
            <View style={styles.feeRow}>
              <FormInput
                label="Registration Fee"
                value={form.registration_fee}
                onChangeText={(registration_fee) => setForm((s) => ({ ...s, registration_fee }))}
                keyboardType="numeric"
                style={styles.feeInput}
                compact
              />
              <FormInput
                label="Exam Fee"
                value={form.exam_fee}
                onChangeText={(exam_fee) => setForm((s) => ({ ...s, exam_fee }))}
                keyboardType="numeric"
                style={styles.feeInput}
                compact
              />
              <FormInput
                label="Certificate Fee"
                value={form.certificate_fee}
                onChangeText={(certificate_fee) => setForm((s) => ({ ...s, certificate_fee }))}
                keyboardType="numeric"
                style={styles.feeInput}
                compact
              />
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Default Total Fee</Text>
              <Text style={styles.totalValue}>{formatCurrency(defaultSlipFeeTotal)}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.optionalHeader}>
              <Text style={styles.optionalTitle}>Extra Charges (Shown in Receipt)</Text>
              <AppButton
                label="Add"
                size="compact"
                variant="ghost"
                fullWidth={false}
                onPress={() => setOptionalFees((prev) => [...prev, createOptionalDraft()])}
              />
            </View>
            {loadingOptionalFees ? <Text style={styles.optionalHint}>Loading class optional charges...</Text> : null}
            {!loadingOptionalFees && !optionalFees.length ? <Text style={styles.optionalHint}>No extra charges configured.</Text> : null}
            {optionalFees.map((item) => (
              <View key={item.localId} style={styles.optionalItemRow}>
                <View style={styles.feeRow}>
                  <FormInput
                    label="Charge Name"
                    value={item.item_name}
                    onChangeText={(item_name) =>
                      setOptionalFees((prev) => prev.map((row) => (row.localId === item.localId ? { ...row, item_name } : row)))
                    }
                    style={styles.feeInput}
                    compact
                  />
                  <FormInput
                    label="Amount"
                    value={item.default_amount}
                    onChangeText={(default_amount) =>
                      setOptionalFees((prev) => prev.map((row) => (row.localId === item.localId ? { ...row, default_amount } : row)))
                    }
                    keyboardType="numeric"
                    style={styles.feeInput}
                    compact
                  />
                </View>
                <View style={styles.optionalFlags}>
                  <Pressable
                    style={[styles.flagChip, item.is_active && styles.flagChipActive]}
                    onPress={() =>
                      setOptionalFees((prev) => prev.map((row) => (row.localId === item.localId ? { ...row, is_active: !row.is_active } : row)))
                    }
                  >
                    <Text style={[styles.flagChipText, item.is_active && styles.flagChipTextActive]}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </Pressable>
                  <AppButton
                    label="Remove"
                    size="compact"
                    variant="secondary"
                    fullWidth={false}
                    onPress={() => setOptionalFees((prev) => prev.filter((row) => row.localId !== item.localId))}
                  />
                </View>
              </View>
            ))}
          </View>

          <FormInput label="Note" value={form.note} onChangeText={(note) => setForm((s) => ({ ...s, note }))} compact />

          <View style={styles.actionRow}>
            <AppButton label={submitting ? 'Saving...' : editingId ? 'Update Class' : 'Create Class'} onPress={save} disabled={submitting} />
            <AppButton label="Cancel" variant="ghost" onPress={resetForm} />
          </View>
        </View>
      ) : null}

      {!isFormMode && loading ? <LoadingState /> : null}
      {!isFormMode && !loading && !classes.length ? <EmptyState title="No classes" description="Create classes to start enrollments." /> : null}

      {!isFormMode ? (
        <FlatList
          {...headerScroll}
          style={styles.list}
          data={classes}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowTop}>
                <Text style={styles.name}>{item.class_name}</Text>
                <Text style={styles.status}>{item.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.meta}>{item.course_name} • {item.category}</Text>
              <Text style={styles.meta}>Fee {formatCurrency(item.base_course_fee)} • Max {item.max_students}</Text>
              <View style={styles.rowButtons}>
                <AppButton label="Edit" size="compact" variant="ghost" onPress={() => onEdit(item)} />
                <AppButton label="Delete" size="compact" variant="secondary" onPress={() => remove(Number(item.id))} />
              </View>
            </View>
          )}
        />
      ) : null}

      {!isFormMode ? (
        <PaginationControls
          limit={PAGE_SIZE}
          offset={offset}
          currentCount={classes.length}
          loading={loading}
          onPrevious={() => {
            const nextOffset = Math.max(offset - PAGE_SIZE, 0);
            setOffset(nextOffset);
            load(keyword, statusFilter, nextOffset);
          }}
          onNext={() => {
            const nextOffset = offset + PAGE_SIZE;
            setOffset(nextOffset);
            load(keyword, statusFilter, nextOffset);
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
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xxs,
    ...theme.shadows.sm
  },
  metricLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  metricValue: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingBottom: theme.spacing.lg
  },
  formCard: {
    gap: theme.spacing.md
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  sectionHint: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  },
  segmentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  segmentChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  segmentChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  segmentText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'capitalize'
  },
  segmentTextActive: {
    color: theme.colors.primary
  },
  feeRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  feeInput: {
    flex: 1
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  totalLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  totalValue: {
    ...theme.typography.subheading,
    color: theme.colors.primary
  },
  optionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs
  },
  optionalTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    flex: 1
  },
  optionalHint: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  },
  optionalItemRow: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs
  },
  optionalFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs
  },
  flagChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  flagChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  flagChipText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  flagChipTextActive: {
    color: theme.colors.primary
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  filterChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface
  },
  filterChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  filterChipText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'capitalize'
  },
  filterChipTextActive: {
    color: theme.colors.primary
  },
  actionRow: {
    gap: theme.spacing.sm
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
    flex: 1
  },
  status: {
    ...theme.typography.caption,
    color: theme.colors.primary
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  },
  rowButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs
  }
});
