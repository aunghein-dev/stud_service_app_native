import React, { useCallback, useEffect, useState } from 'react';
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
import { teachersApi } from '@/services/teachersApi';
import type { Teacher } from '@/types/teacher';
import { theme } from '@/theme';

const salaryTypes: Teacher['salary_type'][] = ['fixed_monthly', 'fixed_per_class', 'future_percentage_based'];
const PAGE_SIZE = 20;

const emptyTeacherForm = {
  teacher_code: '',
  teacher_name: '',
  phone: '',
  address: '',
  subject_specialty: '',
  salary_type: 'fixed_per_class' as Teacher['salary_type'],
  default_fee_amount: '0',
  note: '',
  is_active: true
};

export function TeacherListScreen() {
  const headerScroll = useHeaderAutoHideListScroll();
  const [keyword, setKeyword] = useState('');
  const [offset, setOffset] = useState(0);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyTeacherForm);

  const load = async (q = keyword, nextOffset = offset) => {
    setLoading(true);
    try {
      const list = await teachersApi.list({ q, limit: PAGE_SIZE, offset: nextOffset });
      setTeachers(list);
    } finally {
      setLoading(false);
    }
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
    setForm(emptyTeacherForm);
    setEditingId(null);
    setShowForm(false);
  };

  const onCreate = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(emptyTeacherForm);
  };

  const onEdit = (item: Teacher) => {
    setShowForm(true);
    setEditingId(Number(item.id));
    setForm({
      teacher_code: item.teacher_code,
      teacher_name: item.teacher_name,
      phone: item.phone,
      address: item.address,
      subject_specialty: item.subject_specialty,
      salary_type: item.salary_type,
      default_fee_amount: String(item.default_fee_amount),
      note: item.note,
      is_active: item.is_active
    });
  };

  const save = async () => {
    if (!form.teacher_name.trim() || !form.phone.trim()) {
      Alert.alert('Missing Fields', 'Teacher name and phone are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await teachersApi.update(editingId, {
          teacher_name: form.teacher_name,
          phone: form.phone,
          address: form.address,
          subject_specialty: form.subject_specialty,
          salary_type: form.salary_type,
          default_fee_amount: Number(form.default_fee_amount || 0),
          note: form.note,
          is_active: form.is_active
        });
      } else {
        await teachersApi.create({
          teacher_code: form.teacher_code,
          teacher_name: form.teacher_name,
          phone: form.phone,
          address: form.address,
          subject_specialty: form.subject_specialty,
          salary_type: form.salary_type,
          default_fee_amount: Number(form.default_fee_amount || 0),
          note: form.note,
          is_active: form.is_active
        });
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
    Alert.alert('Delete Teacher', 'Are you sure you want to delete this teacher?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await teachersApi.remove(id);
            await load();
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
        title="Teachers"
        subtitle="Create, edit, and archive teacher records."
        actionLabel="New"
        onActionPress={onCreate}
      />
      <SearchFilterBar
        value={keyword}
        onChangeText={setKeyword}
        onApply={() => {
          setOffset(0);
          load(keyword, 0);
        }}
        placeholder="Search teacher"
      />

      {showForm ? (
        <View style={styles.formCard}>
          {!editingId ? (
            <FormInput label="Teacher Code" value={form.teacher_code} onChangeText={(teacher_code) => setForm((s) => ({ ...s, teacher_code }))} />
          ) : null}
          <FormInput label="Teacher Name" value={form.teacher_name} onChangeText={(teacher_name) => setForm((s) => ({ ...s, teacher_name }))} />
          <FormInput label="Phone" value={form.phone} onChangeText={(phone) => setForm((s) => ({ ...s, phone }))} keyboardType="phone-pad" />
          <FormInput label="Subject Specialty" value={form.subject_specialty} onChangeText={(subject_specialty) => setForm((s) => ({ ...s, subject_specialty }))} />
          <FormInput label="Default Fee" value={form.default_fee_amount} onChangeText={(default_fee_amount) => setForm((s) => ({ ...s, default_fee_amount }))} keyboardType="numeric" />

          <View style={styles.chipGroup}>
            {salaryTypes.map((type) => (
              <Pressable
                key={type}
                style={[styles.chip, form.salary_type === type && styles.chipActive]}
                onPress={() => setForm((s) => ({ ...s, salary_type: type }))}
              >
                <Text style={[styles.chipText, form.salary_type === type && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actionRow}>
            <AppButton label={submitting ? 'Saving...' : editingId ? 'Update Teacher' : 'Create Teacher'} onPress={save} disabled={submitting} />
            <AppButton label="Cancel" variant="ghost" onPress={resetForm} />
          </View>
        </View>
      ) : null}

      {!isFormMode && loading ? <LoadingState /> : null}
      {!isFormMode && !loading && !teachers.length ? <EmptyState title="No teachers" description="Add teacher records to assign classes." /> : null}

      {!isFormMode ? (
        <FlatList
          {...headerScroll}
          style={styles.list}
          data={teachers}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.teacher_name}</Text>
              <Text style={styles.meta}>{item.teacher_code} • {item.salary_type}</Text>
              <Text style={styles.meta}>{item.phone}</Text>
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
          currentCount={teachers.length}
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
  list: {
    flex: 1
  },
  listContent: {
    paddingBottom: theme.spacing.lg
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
  chipGroup: {
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
  name: {
    ...theme.typography.subheading,
    color: theme.colors.text
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
