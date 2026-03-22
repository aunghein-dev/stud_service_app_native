import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
import { useStudentStore } from '@/store/studentStore';
import type { Student } from '@/types/student';
import { theme } from '@/theme';

const genders: Student['gender'][] = ['male', 'female', 'other'];
const PAGE_SIZE = 20;

const emptyStudentForm = {
  student_code: '',
  full_name: '',
  gender: 'other' as Student['gender'],
  date_of_birth: '',
  phone: '',
  guardian_name: '',
  guardian_phone: '',
  address: '',
  school_name: '',
  grade_level: '',
  note: '',
  is_active: true
};

export function StudentListScreen() {
  const navigation = useNavigation<any>();
  const [keyword, setKeyword] = useState('');
  const [offset, setOffset] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyStudentForm);
  const { students, loading, error, fetchStudents, createStudent, updateStudent, deleteStudent } = useStudentStore();

  const load = async (q = keyword, nextOffset = offset) => {
    await fetchStudents({ q, limit: PAGE_SIZE, offset: nextOffset });
  };

  useEffect(() => {
    load('', 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [keyword, offset])
  );

  const resetForm = () => {
    setForm(emptyStudentForm);
    setEditingId(null);
    setShowForm(false);
  };

  const onCreate = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(emptyStudentForm);
  };

  const onEdit = (item: Student) => {
    setShowForm(true);
    setEditingId(Number(item.id));
    setForm({
      student_code: item.student_code,
      full_name: item.full_name,
      gender: item.gender,
      date_of_birth: item.date_of_birth || '',
      phone: item.phone,
      guardian_name: item.guardian_name,
      guardian_phone: item.guardian_phone,
      address: item.address,
      school_name: item.school_name,
      grade_level: item.grade_level,
      note: item.note,
      is_active: item.is_active
    });
  };

  const save = async () => {
    if (!form.full_name.trim() || !form.phone.trim()) {
      Alert.alert('Missing Fields', 'Student name and phone are required.');
      return;
    }
    if (!editingId && !form.student_code.trim()) {
      Alert.alert('Missing Fields', 'Student code is required for new records.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateStudent(editingId, {
          full_name: form.full_name,
          gender: form.gender,
          date_of_birth: form.date_of_birth,
          phone: form.phone,
          guardian_name: form.guardian_name,
          guardian_phone: form.guardian_phone,
          address: form.address,
          school_name: form.school_name,
          grade_level: form.grade_level,
          note: form.note,
          is_active: form.is_active
        });
      } else {
        await createStudent({
          student_code: form.student_code,
          full_name: form.full_name,
          gender: form.gender,
          date_of_birth: form.date_of_birth,
          phone: form.phone,
          guardian_name: form.guardian_name,
          guardian_phone: form.guardian_phone,
          address: form.address,
          school_name: form.school_name,
          grade_level: form.grade_level,
          note: form.note,
          is_active: form.is_active
        });
      }

      await load();
      resetForm();
    } catch (e) {
      Alert.alert('Save failed', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = (id: number) => {
    Alert.alert('Delete Student', 'Are you sure you want to deactivate this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteStudent(id);
            await load();
          } catch (error) {
            Alert.alert('Delete failed', (error as Error).message);
          }
        }
      }
    ]);
  };

  const quickInsights = useMemo(() => {
    const inactive = students.filter((item) => !item.is_active).length;
    const withGuardian = students.filter((item) => item.guardian_name).length;
    return { inactive, withGuardian };
  }, [students]);

  const isFormMode = showForm;

  return (
    <ScreenContainer scroll={isFormMode} contentStyle={styles.container}>
      <PageHeader
        title="Students"
        subtitle="Architecture view for learner profiles, guardian contacts, and lifecycle status."
        actionLabel="New"
        onActionPress={onCreate}
      />

      <HeaderAutoHideSection style={styles.topControls}>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>On Page</Text>
            <Text style={styles.metricValue}>{students.length}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Guardian</Text>
            <Text style={styles.metricValue}>{quickInsights.withGuardian}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Inactive</Text>
            <Text style={styles.metricValue}>{quickInsights.inactive}</Text>
          </View>
        </View>

        <SearchFilterBar
          value={keyword}
          onChangeText={setKeyword}
          onApply={() => {
            setOffset(0);
            load(keyword, 0);
          }}
          placeholder="Search by name, code, phone"
        />
      </HeaderAutoHideSection>

      {showForm ? (
        <View style={styles.formCard}>
          {!editingId ? (
            <FormInput
              label="Student Code"
              value={form.student_code}
              onChangeText={(student_code) => setForm((state) => ({ ...state, student_code }))}
              placeholder="STD-1001"
            />
          ) : null}
          <FormInput
            label="Full Name"
            value={form.full_name}
            onChangeText={(full_name) => setForm((state) => ({ ...state, full_name }))}
          />
          <FormInput
            label="Phone"
            value={form.phone}
            onChangeText={(phone) => setForm((state) => ({ ...state, phone }))}
            keyboardType="phone-pad"
          />
          <FormInput
            label="Guardian Name"
            value={form.guardian_name}
            onChangeText={(guardian_name) => setForm((state) => ({ ...state, guardian_name }))}
          />
          <FormInput
            label="Guardian Phone"
            value={form.guardian_phone}
            onChangeText={(guardian_phone) => setForm((state) => ({ ...state, guardian_phone }))}
            keyboardType="phone-pad"
          />
          <FormInput
            label="School Name"
            value={form.school_name}
            onChangeText={(school_name) => setForm((state) => ({ ...state, school_name }))}
          />
          <FormInput
            label="Grade Level"
            value={form.grade_level}
            onChangeText={(grade_level) => setForm((state) => ({ ...state, grade_level }))}
          />
          <FormInput
            label="Address"
            value={form.address}
            onChangeText={(address) => setForm((state) => ({ ...state, address }))}
          />
          <FormInput
            label="Date of Birth (YYYY-MM-DD)"
            value={form.date_of_birth}
            onChangeText={(date_of_birth) => setForm((state) => ({ ...state, date_of_birth }))}
            placeholder="2009-08-12"
          />
          <FormInput
            label="Note"
            value={form.note}
            onChangeText={(note) => setForm((state) => ({ ...state, note }))}
          />

          <View style={styles.chipWrap}>
            {genders.map((gender) => (
              <Pressable
                key={gender}
                style={[styles.chip, form.gender === gender && styles.chipActive]}
                onPress={() => setForm((state) => ({ ...state, gender }))}
              >
                <Text style={[styles.chipText, form.gender === gender && styles.chipTextActive]}>{gender}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.chipWrap}>
            <Pressable
              style={[styles.chip, form.is_active && styles.chipActive]}
              onPress={() => setForm((state) => ({ ...state, is_active: true }))}
            >
              <Text style={[styles.chipText, form.is_active && styles.chipTextActive]}>Active</Text>
            </Pressable>
            <Pressable
              style={[styles.chip, !form.is_active && styles.chipActive]}
              onPress={() => setForm((state) => ({ ...state, is_active: false }))}
            >
              <Text style={[styles.chipText, !form.is_active && styles.chipTextActive]}>Inactive</Text>
            </Pressable>
          </View>

          <View style={styles.actionsColumn}>
            <AppButton
              label={submitting ? 'Saving...' : editingId ? 'Update Student' : 'Create Student'}
              onPress={save}
              disabled={submitting}
            />
            <AppButton label="Cancel" variant="ghost" onPress={resetForm} />
          </View>
        </View>
      ) : null}

      {!isFormMode && loading ? <LoadingState label="Loading students..." /> : null}
      {!isFormMode && error ? <EmptyState title="Unable to load students" description={error} /> : null}
      {!isFormMode && !loading && !error && !students.length ? (
        <EmptyState title="No students yet" description="Create your first learner profile to start enrollments." />
      ) : null}

      {!isFormMode ? (
        <HeaderAwareFlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={students}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowTop}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={[styles.status, !item.is_active && styles.statusMuted]}>
                  {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
              <Text style={styles.meta}>{item.student_code} • {item.phone}</Text>
              {item.guardian_name || item.guardian_phone ? (
                <Text style={styles.metaSecondary}>
                  {item.guardian_name || 'Guardian'} {item.guardian_phone ? `• ${item.guardian_phone}` : ''}
                </Text>
              ) : null}
              <View style={styles.rowButtons}>
                <AppButton label="Edit" size="compact" variant="ghost" onPress={() => onEdit(item)} />
                <AppButton label="Delete" size="compact" variant="secondary" onPress={() => remove(Number(item.id))} />
              </View>
            </View>
          )}
        />
      ) : null}

      {!isFormMode ? (
        <AppButton
          label="Open Dedicated Student Form"
          variant="ghost"
          onPress={() => navigation.navigate('StudentCreate')}
        />
      ) : null}

      {!isFormMode ? (
        <PaginationControls
          limit={PAGE_SIZE}
          offset={offset}
          currentCount={students.length}
          loading={loading}
          onPrevious={() => {
            const nextOffset = Math.max(offset - PAGE_SIZE, 0);
            setOffset(nextOffset);
            load(keyword, nextOffset);
          }}
          onNext={() => {
            const nextOffset = offset + PAGE_SIZE;
            setOffset(nextOffset);
            load(keyword, nextOffset);
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
  topControls: {
    gap: theme.spacing.sm
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.xxs
  },
  metricLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  },
  metricValue: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text
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
  actionsColumn: {
    gap: theme.spacing.sm
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingBottom: theme.spacing.xxl
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
    color: theme.colors.success
  },
  statusMuted: {
    color: theme.colors.textSubtle
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
