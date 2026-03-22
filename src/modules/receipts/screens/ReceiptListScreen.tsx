import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchFilterBar } from '@/components/common/SearchFilterBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AppButton } from '@/components/common/AppButton';
import { PaginationControls } from '@/components/common/PaginationControls';
import { useHeaderAutoHideListScroll } from '@/components/common/headerMotion';
import { FormInput } from '@/components/form/FormInput';
import { useReceiptStore } from '@/store/receiptStore';
import { formatCurrency } from '@/utils/currency';
import { theme } from '@/theme';

const PAGE_SIZE = 20;

export function ReceiptListScreen() {
  const headerScroll = useHeaderAutoHideListScroll();
  const navigation = useNavigation<any>();
  const [receiptNo, setReceiptNo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [offset, setOffset] = useState(0);
  const { receipts, loading, error, fetchReceipts } = useReceiptStore();

  const load = async ({
    nextReceiptNo = receiptNo,
    nextDateFrom = dateFrom,
    nextDateTo = dateTo,
    nextOffset = offset
  }: {
    nextReceiptNo?: string;
    nextDateFrom?: string;
    nextDateTo?: string;
    nextOffset?: number;
  } = {}) => {
    await fetchReceipts({
      receipt_no: nextReceiptNo || undefined,
      date_from: nextDateFrom || undefined,
      date_to: nextDateTo || undefined,
      limit: PAGE_SIZE,
      offset: nextOffset
    });
  };

  useEffect(() => {
    load({ nextOffset: 0 });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [receiptNo, dateFrom, dateTo, offset])
  );

  return (
    <ScreenContainer scroll={false} contentStyle={styles.container}>
      <PageHeader
        title="Receipts"
        subtitle="Search, filter by date, and paginate receipt records."
      />

      <SearchFilterBar
        value={receiptNo}
        onChangeText={setReceiptNo}
        onApply={() => {
          setOffset(0);
          load({ nextReceiptNo: receiptNo, nextOffset: 0 });
        }}
        placeholder="Receipt No"
      />

      <View style={styles.dateFilterRow}>
        <FormInput
          label="Date From"
          value={dateFrom}
          onChangeText={setDateFrom}
          placeholder="From YYYY-MM-DD"
          compact
          hideLabel
          style={styles.dateField}
        />
        <FormInput
          label="Date To"
          value={dateTo}
          onChangeText={setDateTo}
          placeholder="To YYYY-MM-DD"
          compact
          hideLabel
          style={styles.dateField}
        />
      </View>

      <View style={styles.filterActions}>
        <AppButton
          label="Apply Date"
          variant="secondary"
          size="compact"
          fullWidth={false}
          onPress={() => {
            setOffset(0);
            load({ nextDateFrom: dateFrom, nextDateTo: dateTo, nextOffset: 0 });
          }}
        />
        <AppButton
          label="Clear"
          variant="ghost"
          size="compact"
          fullWidth={false}
          onPress={() => {
            setDateFrom('');
            setDateTo('');
            setOffset(0);
            load({ nextDateFrom: '', nextDateTo: '', nextOffset: 0 });
          }}
        />
      </View>

      {loading ? <LoadingState /> : null}
      {error ? <EmptyState title="Unable to load receipts" description={error} /> : null}
      {!loading && !receipts.length ? (
        <EmptyState title="No receipts" description="Receipts appear after enrollment/payment transactions." />
      ) : null}

      <FlatList
        {...headerScroll}
        style={styles.list}
        data={receipts}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('ReceiptDetail', { key: item.receipt_no })}>
            <View style={styles.rowTop}>
              <Text style={styles.name}>{item.receipt_no}</Text>
              <Text style={styles.amount}>{formatCurrency(item.paid_amount)}</Text>
            </View>
            <Text style={styles.meta}>{item.receipt_type} • {item.issued_at}</Text>
            <Text style={styles.metaSecondary}>Remaining {formatCurrency(item.remaining_amount)}</Text>
          </Pressable>
        )}
      />

      <PaginationControls
        limit={PAGE_SIZE}
        offset={offset}
        currentCount={receipts.length}
        loading={loading}
        onPrevious={() => {
          const nextOffset = Math.max(offset - PAGE_SIZE, 0);
          setOffset(nextOffset);
          load({ nextOffset });
        }}
        onNext={() => {
          const nextOffset = offset + PAGE_SIZE;
          setOffset(nextOffset);
          load({ nextOffset });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.sm
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  dateField: {
    flex: 1
  },
  filterActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap'
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingBottom: theme.spacing.lg
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
  amount: {
    ...theme.typography.subheading,
    color: theme.colors.primary
  },
  meta: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  },
  metaSecondary: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  }
});
