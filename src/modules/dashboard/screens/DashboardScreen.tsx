import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryCard } from '@/components/cards/SummaryCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { useDashboardStore } from '@/store/dashboardStore';
import { formatCompactNumber } from '@/utils/currency';
import { theme } from '@/theme';

type QuickTileProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function QuickTile({ label, value, icon, onPress }: QuickTileProps) {
  return (
    <Pressable style={({ pressed }) => [styles.quickTile, pressed && styles.quickTilePressed]} onPress={onPress}>
      <View style={styles.quickTileIconWrap}>
        <Ionicons name={icon} size={14} color={theme.colors.primary} />
      </View>
      <View style={styles.quickTileCopy}>
        <Text style={styles.quickTileLabel}>{label}</Text>
        <Text style={styles.quickTileValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={theme.colors.textSubtle} />
    </Pressable>
  );
}

type AnalysisPillProps = {
  label: string;
  value: string;
  tone?: 'primary' | 'accent' | 'neutral';
};

function AnalysisPill({ label, value, tone = 'neutral' }: AnalysisPillProps) {
  return (
    <View style={[styles.analysisPill, tone === 'primary' && styles.analysisPillPrimary, tone === 'accent' && styles.analysisPillAccent]}>
      <Text style={styles.analysisPillLabel}>{label}</Text>
      <Text style={styles.analysisPillValue}>{value}</Text>
    </View>
  );
}

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { summary, gross, loading, refresh, error } = useDashboardStore();

  const chartRows = gross?.rows.slice(0, 5) || [];
  const maxGrossValue = chartRows.length ? Math.max(...chartRows.map((row) => row.gross), 1) : 1;
  const monthlyMargin = summary?.monthly_income
    ? (summary.monthly_gross / summary.monthly_income) * 100
    : 0;
  const expenseLoad = summary?.monthly_income
    ? (summary.monthly_expenses / summary.monthly_income) * 100
    : 0;
  const duesPressure = summary?.total_students
    ? (summary.pending_dues_count / summary.total_students) * 100
    : 0;

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading && !summary) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading dashboard..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader
        title="Home"
        subtitle="Compact operations command center for classes, collections, and performance."
      />

      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
          <Pressable style={styles.heroLink} onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.heroLinkText}>Open Reports</Text>
          </Pressable>
        </View>
        <Text style={styles.heroLabel}>Today Gross</Text>
        <Text style={styles.heroAmount}>{summary ? formatCompactNumber(summary.today_gross) : '-'}</Text>
        <View style={styles.heroMiniRow}>
          <View style={styles.heroMiniCard}>
            <Text style={styles.heroMiniLabel}>Income</Text>
            <Text style={styles.heroMiniValue}>{summary ? formatCompactNumber(summary.today_income) : '-'}</Text>
          </View>
          <View style={styles.heroMiniCard}>
            <Text style={styles.heroMiniLabel}>Expense</Text>
            <Text style={styles.heroMiniValue}>{summary ? formatCompactNumber(summary.today_expenses) : '-'}</Text>
          </View>
          <View style={styles.heroMiniCard}>
            <Text style={styles.heroMiniLabel}>Month Gross</Text>
            <Text style={styles.heroMiniValue}>{summary ? formatCompactNumber(summary.monthly_gross) : '-'}</Text>
          </View>
        </View>
      </View>

      {summary ? (
        <View style={styles.quickGrid}>
          <QuickTile
            label="Students"
            value={formatCompactNumber(summary.total_students, 0)}
            icon="people-outline"
            onPress={() => navigation.navigate('Students')}
          />
          <QuickTile
            label="Teachers"
            value={formatCompactNumber(summary.total_teachers, 0)}
            icon="person-circle-outline"
            onPress={() => navigation.navigate('Teachers')}
          />
          <QuickTile
            label="Active Classes"
            value={formatCompactNumber(summary.total_active_classes, 0)}
            icon="book-outline"
            onPress={() => navigation.navigate('Classes', { presetStatus: 'running', title: 'Active Classes' })}
          />
        </View>
      ) : null}

      {error ? <EmptyState title="Unable to load" description={error} /> : null}

      {summary ? (
        <View style={styles.grid}>
          <SummaryCard label="Today Income" value={formatCompactNumber(summary.today_income)} tone="accent" onPress={() => navigation.navigate('Payments')} />
          <SummaryCard label="Today Expense" value={formatCompactNumber(summary.today_expenses)} onPress={() => navigation.navigate('Expenses')} />
          <SummaryCard label="Monthly Income" value={formatCompactNumber(summary.monthly_income)} tone="accent" onPress={() => navigation.navigate('Payments')} />
          <SummaryCard label="Monthly Expense" value={formatCompactNumber(summary.monthly_expenses)} onPress={() => navigation.navigate('Expenses')} />
          <SummaryCard label="Pending Dues" value={formatCompactNumber(summary.pending_dues_count, 0)} tone="primary" onPress={() => navigation.navigate('Enrollments')} />
          <SummaryCard label="Monthly Gross" value={formatCompactNumber(summary.monthly_gross)} tone="primary" onPress={() => navigation.navigate('Reports')} />
        </View>
      ) : (
        <EmptyState title="No dashboard data" description="Run some transactions to populate your dashboard." />
      )}

      {summary ? (
        <View style={styles.analysisCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Analysis</Text>
            <Text style={styles.sectionCaption}>Auto KPI</Text>
          </View>
          <View style={styles.analysisRow}>
            <AnalysisPill label="Monthly Margin" value={`${monthlyMargin.toFixed(1)}%`} tone={monthlyMargin >= 0 ? 'primary' : 'accent'} />
            <AnalysisPill label="Expense Load" value={`${expenseLoad.toFixed(1)}%`} tone="accent" />
            <AnalysisPill label="Dues Pressure" value={`${duesPressure.toFixed(1)}%`} />
          </View>
        </View>
      ) : null}

      {chartRows.length ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gross Chart</Text>
            <Text style={styles.sectionCaption}>Top 5</Text>
          </View>

          {chartRows.map((row) => {
            const ratio = Math.max(Math.round((row.gross / maxGrossValue) * 100), 6);
            return (
              <Pressable
                key={row.class_course_id}
                style={({ pressed }) => [styles.chartRow, pressed && styles.rowPressed]}
                onPress={() => navigation.navigate('Classes', { title: row.class_name })}
              >
                <View style={styles.chartTop}>
                  <Text style={styles.rowTitle}>{row.class_name}</Text>
                  <Text style={styles.rowValue}>{formatCompactNumber(row.gross)}</Text>
                </View>
                <View style={styles.chartTrack}>
                  <View style={[styles.chartFill, { width: `${ratio}%` }]} />
                </View>
                <Text style={styles.rowMeta}>
                  Income {formatCompactNumber(row.income)} • Expense {formatCompactNumber(row.expenses)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {gross ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Class Gross</Text>
            <Text style={styles.sectionCaption}>Tap to open</Text>
          </View>

          {gross.rows.slice(0, 5).map((row, idx) => (
            <Pressable
              key={row.class_course_id}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate('Classes', { title: row.class_name })}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{idx + 1}</Text>
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{row.class_name}</Text>
                <Text style={styles.rowMeta}>
                  In {formatCompactNumber(row.income)} • Ex {formatCompactNumber(row.expenses)}
                </Text>
              </View>
              <Text style={styles.rowValue}>{formatCompactNumber(row.gross)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#e7f3ee',
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: '#c5ddd2',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.sm
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: '#9ac3b2',
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.primaryMuted
  },
  liveText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    textTransform: 'uppercase'
  },
  heroLink: {
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: '#b4cdc2',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3
  },
  heroLinkText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  heroLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  heroAmount: {
    ...theme.typography.display,
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 34
  },
  heroMiniRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  heroMiniCard: {
    flex: 1,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: '#cee2d9',
    backgroundColor: 'rgba(255,255,255,0.72)',
    padding: theme.spacing.xs,
    gap: 1
  },
  heroMiniLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
    textTransform: 'uppercase'
  },
  heroMiniValue: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text
  },
  quickGrid: {
    gap: theme.spacing.xs
  },
  quickTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 9,
    ...theme.shadows.sm
  },
  quickTilePressed: {
    transform: [{ scale: 0.988 }]
  },
  quickTileIconWrap: {
    width: 28,
    height: 28,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickTileCopy: {
    flex: 1,
    gap: 1
  },
  quickTileLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  quickTileValue: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  analysisCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.sm
  },
  analysisRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  analysisPill: {
    flex: 1,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.xs,
    gap: theme.spacing.xxs
  },
  analysisPillPrimary: {
    borderColor: '#b4d5c8',
    backgroundColor: '#e9f5ef'
  },
  analysisPillAccent: {
    borderColor: '#e5c79f',
    backgroundColor: '#faefe0'
  },
  analysisPillLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  analysisPillValue: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
    ...theme.shadows.sm
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    ...theme.typography.heading,
    color: theme.colors.text
  },
  sectionCaption: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle
  },
  chartRow: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  chartTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm
  },
  chartTrack: {
    height: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: '#dce8e1',
    overflow: 'hidden'
  },
  chartFill: {
    height: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.primary
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.sm
  },
  rowPressed: {
    transform: [{ scale: 0.99 }]
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: '#e1be90',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankText: {
    ...theme.typography.caption,
    color: theme.colors.accent
  },
  rowCopy: {
    flex: 1,
    gap: 1
  },
  rowTitle: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text
  },
  rowMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  rowValue: {
    ...theme.typography.subheading,
    color: theme.colors.primary
  }
});
