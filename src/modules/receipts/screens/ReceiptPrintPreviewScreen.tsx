import React, { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ReceiptPreviewCard } from '@/components/receipt/ReceiptPreviewCard';
import { useReceiptStore } from '@/store/receiptStore';

export function ReceiptPrintPreviewScreen() {
  const route = useRoute<any>();
  const { activeReceipt, loading, error, fetchReceiptDetail } = useReceiptStore();
  const key = route.params?.key as string;

  useEffect(() => {
    if (!key) {
      return;
    }
    if (!activeReceipt || activeReceipt.receipt_no !== key) {
      fetchReceiptDetail(key);
    }
  }, [activeReceipt, fetchReceiptDetail, key]);

  if (!activeReceipt || activeReceipt.receipt_no !== key) {
    return (
      <ScreenContainer>
        <PageHeader title="Print Preview" subtitle="Generate a full printable slip with complete details." />
        {loading ? <LoadingState label="Loading slip..." /> : null}
        {error ? <EmptyState title="Unable to load slip" description={error} /> : null}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader title="Print Preview" subtitle="Review and export this receipt slip." />
      <ReceiptPreviewCard receipt={activeReceipt} />
    </ScreenContainer>
  );
}
