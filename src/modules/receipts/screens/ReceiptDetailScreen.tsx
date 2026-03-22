import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AppButton } from '@/components/common/AppButton';
import { ReceiptPreviewCard } from '@/components/receipt/ReceiptPreviewCard';
import { useReceiptStore } from '@/store/receiptStore';
import { theme } from '@/theme';

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function asText(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return fallback;
}

export function ReceiptDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const key = route.params?.key as string;
  const { activeReceipt, loading, error, fetchReceiptDetail } = useReceiptStore();

  useEffect(() => {
    fetchReceiptDetail(key);
  }, [fetchReceiptDetail, key]);

  const enrollmentSearchKey = useMemo(() => {
    if (!activeReceipt) {
      return '';
    }
    const payload = asRecord(activeReceipt.payload);
    const nestedEnrollment = asRecord(payload.enrollment);
    return (
      asText(payload.enrollment_code) ||
      asText(nestedEnrollment.enrollment_code) ||
      String(activeReceipt.enrollment_id)
    );
  }, [activeReceipt]);

  return (
    <ScreenContainer>
      <PageHeader title="Receipt Detail" />
      {loading ? <LoadingState label="Loading receipt..." /> : null}
      {error ? <EmptyState title="Receipt not found" description={error} /> : null}
      {activeReceipt ? <ReceiptPreviewCard receipt={activeReceipt} /> : null}

      {activeReceipt ? (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Edit / Delete Source Entries</Text>
          <Text style={styles.actionText}>
            Fee fields are maintained in Enrollment entry. Payment amount/method is maintained in Payment entry.
          </Text>
          <View style={styles.actionRow}>
            <AppButton
              label="Open Enrollment Entry"
              variant="secondary"
              size="compact"
              fullWidth={false}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Enrollments', params: { focusEnrollmentCode: enrollmentSearchKey } })}
            />
            <AppButton
              label="Open Payment Entry"
              variant="ghost"
              size="compact"
              fullWidth={false}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Payments', params: { focusReceiptNo: activeReceipt.receipt_no } })}
            />
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
    ...theme.shadows.sm
  },
  actionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  actionText: {
    ...theme.typography.body,
    color: theme.colors.text
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  }
});
