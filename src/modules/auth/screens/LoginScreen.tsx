import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthShell } from '@/components/auth/AuthShell';
import { AppButton } from '@/components/common/AppButton';
import { FormInput } from '@/components/form/FormInput';
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
      <View style={styles.form}>
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
      </View>

      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

      <AppButton label={submitting ? 'Signing In...' : 'Sign In'} onPress={handleLogin} disabled={submitting} />
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
