import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { AppButton } from '@/components/common/AppButton';
import { FormInput } from '@/components/form/FormInput';
import { Gap } from '@/components/layout/Gap';
import { useStudentStore } from '@/store/studentStore';
import { theme } from '@/theme';

const studentSchema = z.object({
  student_code: z.string().min(2),
  full_name: z.string().min(2),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  phone: z.string().min(5),
  guardian_name: z.string().optional().default(''),
  guardian_phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  school_name: z.string().optional().default(''),
  grade_level: z.string().optional().default(''),
  note: z.string().optional().default('')
});

type StudentForm = z.infer<typeof studentSchema>;

export function StudentCreateScreen() {
  const navigation = useNavigation<any>();
  const { createStudent } = useStudentStore();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: 'other',
      student_code: '',
      full_name: '',
      phone: '',
      guardian_name: '',
      guardian_phone: '',
      address: '',
      school_name: '',
      grade_level: '',
      note: ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createStudent({
        ...values,
        date_of_birth: '',
        is_active: true
      });
      Alert.alert('Saved', 'Student profile has been created.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Save Failed', (error as Error).message);
    }
  });

  return (
    <ScreenContainer>
      <PageHeader title="Create Student" subtitle="Capture required details and keep profiles clean." />
      <View style={styles.formCard}>
        <Gap size="md">
          <Controller
            control={control}
            name="student_code"
            render={({ field: { value, onChange } }) => (
              <FormInput
                label="Student Code"
                value={value}
                onChangeText={onChange}
                error={errors.student_code?.message}
                placeholder="S-103"
              />
            )}
          />
          <Controller
            control={control}
            name="full_name"
            render={({ field: { value, onChange } }) => (
              <FormInput
                label="Full Name"
                value={value}
                onChangeText={onChange}
                error={errors.full_name?.message}
                placeholder="Mia Collins"
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange } }) => (
              <FormInput
                label="Phone"
                value={value}
                onChangeText={onChange}
                error={errors.phone?.message}
                keyboardType="phone-pad"
                placeholder="+1-200-000-0003"
              />
            )}
          />
          <Controller
            control={control}
            name="guardian_name"
            render={({ field: { value, onChange } }) => (
              <FormInput label="Guardian Name" value={value} onChangeText={onChange} placeholder="Optional" />
            )}
          />
          <Text style={styles.hint}>Gender, school, and note fields can be extended in the next iteration.</Text>
          <AppButton label={isSubmitting ? 'Saving...' : 'Save Student'} onPress={onSubmit} disabled={isSubmitting} />
        </Gap>
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
    ...theme.shadows.md
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  }
});
