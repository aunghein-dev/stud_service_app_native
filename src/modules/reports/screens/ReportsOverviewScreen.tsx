import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { AppButton } from '@/components/common/AppButton';
import { PaginationControls } from '@/components/common/PaginationControls';
import { useHeaderAutoHideListScroll } from '@/components/common/headerMotion';
import { FormInput } from '@/components/form/FormInput';
import { reportsApi } from '@/services/reportsApi';
import type { GrossReport } from '@/types/report';
import { formatCurrency } from '@/utils/currency';
import { theme } from '@/theme';

const PAGE_SIZE = 15;

export function ReportsOverviewScreen() {
  const headerScroll = useHeaderAutoHideListScroll();
  const [gross, setGross] = useState<GrossReport>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [className, setClassName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [offset, setOffset] = useState(0);

  const load = async ({
    nextOffset = offset,
    nextClassName = className,
    nextDateFrom = dateFrom,
    nextDateTo = dateTo
  }: {
    nextOffset?: number;
    nextClassName?: string;
    nextDateFrom?: string;
    nextDateTo?: string;
  } = {}) => {
    setLoading(true);
    setError(undefined);
    try {
      setGross(
        await reportsApi.gross({
          class_course_name: nextClassName || undefined,
          date_from: nextDateFrom || undefined,
          date_to: nextDateTo || undefined,
          limit: PAGE_SIZE,
          offset: nextOffset
        })
      );
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ nextOffset: 0 });
  }, []);

  return (
    <ScreenContainer scroll={false} contentStyle={styles.container}>
      <PageHeader
        title="Reports"
        subtitle="Gross performance with class/date filters and pagination."
      />

      <View style={styles.filterCard}>
        <FormInput
          label="Class Name"
          value={className}
          onChangeText={setClassName}
          placeholder="Class name"
          compact
          hideLabel
        />
        <View style={styles.dateRow}>
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
            label="Apply"
            variant="secondary"
            size="compact"
            fullWidth={false}
            onPress={() => {
              setOffset(0);
              load({ nextOffset: 0 });
            }}
          />
          <AppButton
            label="Clear"
            variant="ghost"
            size="compact"
            fullWidth={false}
            onPress={() => {
              setClassName('');
              setDateFrom('');
              setDateTo('');
              setOffset(0);
              load({ nextOffset: 0, nextClassName: '', nextDateFrom: '', nextDateTo: '' });
            }}
          />
        </View>
      </View>

      {loading ? <LoadingState /> : null}
      {error ? <EmptyState title="Unable to load reports" description={error} /> : null}
      {!loading && !error && !gross ? <EmptyState title="No report data" description="Add transactions to generate report insights." /> : null}

      {gross ? (
        <FlatList
          {...headerScroll}
          style={styles.list}
          data={gross.rows}
          keyExtractor={(item) => String(item.class_course_id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.summary}>
              <Text style={styles.summaryText}>Total Income: {formatCurrency(gross.total_income)}</Text>
              <Text style={styles.summaryText}>Total Expense: {formatCurrency(gross.total_expenses)}</Text>
              <Text style={styles.gross}>Gross: {formatCurrency(gross.total_gross)}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.class_name}</Text>
              <Text style={styles.amount}>{formatCurrency(item.gross)}</Text>
            </View>
          )}
        />
      ) : null}

      {gross ? (
        <PaginationControls
          limit={PAGE_SIZE}
          offset={offset}
          currentCount={gross.rows.length}
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
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm
  },
  filterCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
    ...theme.shadows.sm
  },
  dateRow: {
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
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm
  },
  summary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm
  },
  summaryText: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  },
  gross: {
    ...theme.typography.subheading,
    color: theme.colors.primary
  },
  row: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.sm
  },
  name: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text,
    flex: 1
  },
  amount: {
    ...theme.typography.subheading,
    color: theme.colors.primary
  }
});
