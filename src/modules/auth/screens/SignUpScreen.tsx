import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthShell } from '@/components/auth/AuthShell';
import { AppButton } from '@/components/common/AppButton';
import { FormInput } from '@/components/form/FormInput';
import type { RootStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/theme';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const signUp = useAuthStore((state) => state.signUp);
  const submitting = useAuthStore((state) => state.submitting);
  const authError = useAuthStore((state) => state.error);

  const [schoolName, setSchoolName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!slugEdited) {
      setTenantSlug(slugify(schoolName));
    }
  }, [schoolName, slugEdited]);

  const handleSignUp = async () => {
    if (!schoolName.trim() || !tenantSlug.trim() || !adminName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Details', 'School name, tenant slug, admin name, email, and password are required.');
      return;
    }

    try {
      await signUp({
        school_name: schoolName.trim(),
        tenant_slug: tenantSlug.trim().toLowerCase(),
        admin_name: adminName.trim(),
        email: email.trim().toLowerCase(),
        password,
        school_phone: schoolPhone.trim(),
        school_address: schoolAddress.trim()
      });
    } catch (error) {
      Alert.alert('Workspace Setup Failed', (error as Error).message);
    }
  };

  return (
    <AuthShell
      eyebrow="New Workspace"
      title="Create a tenant for your school"
      subtitle="Set up a school-specific workspace so each organization gets its own login, branding, receipts, students, and finance records."
      palette="signup"
      footerText="Already have a workspace?"
      footerActionLabel="Sign in"
      onFooterActionPress={() => navigation.navigate('Login')}
    >
      <View style={styles.form}>
        <FormInput
          label="School Name"
          value={schoolName}
          onChangeText={setSchoolName}
          placeholder="Bright Future Academy"
          autoCapitalize="words"
        />
        <FormInput
          label="Tenant Slug"
          value={tenantSlug}
          onChangeText={(value) => {
            setSlugEdited(true);
            setTenantSlug(slugify(value));
          }}
          placeholder="bright-future-academy"
          autoCapitalize="none"
          autoComplete="off"
        />
        <FormInput
          label="Admin Name"
          value={adminName}
          onChangeText={setAdminName}
          placeholder="Aung Hein"
          autoCapitalize="words"
        />
        <FormInput
          label="Admin Email"
          value={email}
          onChangeText={setEmail}
          placeholder="admin@school.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <FormInput
          label="School Phone"
          value={schoolPhone}
          onChangeText={setSchoolPhone}
          placeholder="09xxxxxxx"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <FormInput
          label="School Address"
          value={schoolAddress}
          onChangeText={setSchoolAddress}
          placeholder="Campus address for receipts"
          multiline
          autoCapitalize="sentences"
        />
      </View>

      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

      <AppButton label={submitting ? 'Creating Workspace...' : 'Create Workspace'} onPress={handleSignUp} disabled={submitting} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.md
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    textAlign: 'center'
  }
});
