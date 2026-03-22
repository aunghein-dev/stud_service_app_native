import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { AppButton } from '@/components/common/AppButton';
import { FormInput } from '@/components/form/FormInput';
import { settingsApi } from '@/services/settingsApi';
import { useAuthStore } from '@/store/authStore';
import type { Settings } from '@/types/settings';
import { theme } from '@/theme';

export function SettingsScreen() {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    school_name: '',
    school_address: '',
    school_phone: '',
    default_currency: 'MMK',
    receipt_prefix: 'RC',
    receipt_last_number: 0,
    payment_methods: ['cash', 'bank_transfer', 'mobile_wallet'],
    optional_item_defaults: ['books', 'uniform', 'stationery'],
    print_preferences: { show_logo: true }
  });

  const schoolBadge = useMemo(() => {
    const base = (settings.school_name || 'School')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
    return base || 'SC';
  }, [settings.school_name]);

  useEffect(() => {
    setLoading(true);
    settingsApi
      .get()
      .then(setSettings)
      .catch((error) => Alert.alert('Settings Error', (error as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const schoolName = settings.school_name.trim();
    const defaultCurrency = settings.default_currency.trim().toUpperCase();
    const receiptPrefix = settings.receipt_prefix.trim().toUpperCase();

    if (!schoolName || !defaultCurrency || !receiptPrefix) {
      Alert.alert('Missing Fields', 'School name, currency, and receipt prefix are required.');
      return;
    }

    setLoading(true);
    try {
      const updated = await settingsApi.update({
        ...settings,
        school_name: schoolName,
        school_address: settings.school_address.trim(),
        school_phone: settings.school_phone.trim(),
        default_currency: defaultCurrency,
        receipt_prefix: receiptPrefix
      });
      setSettings(updated);
      if (session) {
        setSession({
          ...session,
          tenant: {
            ...session.tenant,
            school_name: updated.school_name,
            school_address: updated.school_address,
            school_phone: updated.school_phone
          }
        });
      }
      Alert.alert('Saved', 'Settings updated successfully.');
    } catch (error) {
      Alert.alert('Save Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title="Settings"
        subtitle="Brand, receipts, and defaults in one compact control room."
      />

      <View style={styles.heroCard}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>{schoolBadge}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{settings.school_name || 'School Profile'}</Text>
          <Text style={styles.heroSubtitle}>{settings.school_address || 'Add school address for receipts'}</Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaChip}>
              <Ionicons name="wallet-outline" size={12} color={theme.colors.primary} />
              <Text style={styles.heroMetaText}>{settings.default_currency}</Text>
            </View>
            <View style={styles.heroMetaChip}>
              <Ionicons name="receipt-outline" size={12} color={theme.colors.primary} />
              <Text style={styles.heroMetaText}>
                {settings.receipt_prefix}-{settings.receipt_last_number + 1}
              </Text>
            </View>
            {session?.tenant?.slug ? (
              <View style={styles.heroMetaChip}>
                <Ionicons name="git-network-outline" size={12} color={theme.colors.primary} />
                <Text style={styles.heroMetaText}>{session.tenant.slug}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Ionicons name="business-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.panelTitle}>School Profile</Text>
        </View>
        <FormInput
          label="School Name"
          value={settings.school_name}
          onChangeText={(school_name) => setSettings((s) => ({ ...s, school_name }))}
          placeholder="Enter school name"
          compact
        />
        <FormInput
          label="School Address"
          value={settings.school_address}
          onChangeText={(school_address) => setSettings((s) => ({ ...s, school_address }))}
          placeholder="Enter address"
          multiline
          compact
        />
        <FormInput
          label="School Phone"
          value={settings.school_phone}
          onChangeText={(school_phone) => setSettings((s) => ({ ...s, school_phone }))}
          keyboardType="phone-pad"
          placeholder="Enter phone"
          compact
        />
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Ionicons name="settings-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.panelTitle}>Receipt & Billing</Text>
        </View>
        <View style={styles.row}>
          <FormInput
            label="Receipt Prefix"
            value={settings.receipt_prefix}
            onChangeText={(receipt_prefix) => setSettings((s) => ({ ...s, receipt_prefix }))}
            placeholder="RC"
            compact
            style={styles.rowInput}
          />
          <FormInput
            label="Currency"
            value={settings.default_currency}
            onChangeText={(default_currency) => setSettings((s) => ({ ...s, default_currency }))}
            placeholder="MMK"
            compact
            style={styles.rowInput}
          />
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="print-outline" size={14} color={theme.colors.textMuted} />
        <Text style={styles.infoText}>
          Receipt logo printing is {settings.print_preferences?.show_logo ? 'enabled' : 'disabled'}.
        </Text>
      </View>

      {session ? (
        <View style={styles.infoCard}>
          <Ionicons name="person-outline" size={14} color={theme.colors.textMuted} />
          <Text style={styles.infoText}>
            Signed in as {session.user.full_name} ({session.user.email})
          </Text>
        </View>
      ) : null}

      <AppButton label={loading ? 'Saving...' : 'Save Settings'} onPress={save} disabled={loading} />
      <AppButton label="Sign Out" onPress={signOut} variant="secondary" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#e8f4ef',
    borderWidth: 1,
    borderColor: '#caded3',
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm
  },
  badgeWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    ...theme.typography.subheading,
    color: theme.colors.onPrimary
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xxs
  },
  heroTitle: {
    ...theme.typography.heading,
    color: theme.colors.text
  },
  heroSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xxs
  },
  heroMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#b8d3c7',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3
  },
  heroMetaText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.sm
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  panelTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
    textTransform: 'uppercase'
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  rowInput: {
    flex: 1
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    flex: 1
  }
});
