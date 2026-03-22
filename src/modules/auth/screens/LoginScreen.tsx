import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthShell } from '@/components/auth/AuthShell';
import { AppButton } from '@/components/common/AppButton';
import { FormInput } from '@/components/form/FormInput';
import { Gap } from '@/components/layout/Gap';
import type { RootStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/theme';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const signIn = useAuthStore((state) => state.signIn);
  const submitting = useAuthStore((state) => state.submitting);
  const authError = useAuthStore((state) => state.error);

  const [tenantSlug, setTenantSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!tenantSlug.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Details', 'Tenant slug, email, and password are required.');
      return;
    }
    if (tenantSlug.trim().length < 3) {
      Alert.alert('Invalid Tenant', 'Tenant slug must be at least 3 characters.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters.');
      return;
    }

    try {
      await signIn({
        tenant_slug: tenantSlug.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password
      });
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in to your school workspace"
      subtitle="Each campus keeps its own students, classes, payments, receipts, and settings behind a tenant-aware login."
      footerText="Need a new school workspace?"
      footerActionLabel="Create one"
      onFooterActionPress={() => navigation.navigate('SignUp')}
    >
      <Gap size="md">
        <FormInput
          label="Tenant Slug"
          value={tenantSlug}
          onChangeText={setTenantSlug}
          placeholder="bright-future"
          autoCapitalize="none"
          autoComplete="off"
        />
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="owner@school.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
        />
      </Gap>

      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

      <AppButton label={submitting ? 'Signing In...' : 'Sign In'} onPress={handleLogin} disabled={submitting} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    textAlign: 'center'
  }
});
