import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader';
import type { RootStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type TabRoute = 'Students' | 'Enrollments' | 'Payments';
type StackRoute = 'Teachers' | 'Classes' | 'Receipts' | 'Reports' | 'Expenses' | 'Settings';
type RouteTarget = TabRoute | StackRoute;

type HubTile = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: RouteTarget;
  tint: 'primary' | 'accent' | 'default';
};

const operationsTiles: HubTile[] = [
  { title: 'Students', subtitle: 'Profiles and guardians', icon: 'people-outline', route: 'Students', tint: 'primary' },
  { title: 'Enrollments', subtitle: 'Class admissions', icon: 'school-outline', route: 'Enrollments', tint: 'accent' },
  { title: 'Payments', subtitle: 'Cashflow transactions', icon: 'wallet-outline', route: 'Payments', tint: 'primary' }
];

const managementTiles: HubTile[] = [
  { title: 'Teachers', subtitle: 'Staff and compensation', icon: 'person-circle-outline', route: 'Teachers', tint: 'default' },
  { title: 'Classes', subtitle: 'Course architecture', icon: 'book-outline', route: 'Classes', tint: 'primary' },
  { title: 'Expenses', subtitle: 'Operational costs', icon: 'card-outline', route: 'Expenses', tint: 'accent' }
];

const intelligenceTiles: HubTile[] = [
  { title: 'Receipts', subtitle: 'Printable records', icon: 'receipt-outline', route: 'Receipts', tint: 'default' },
  { title: 'Reports', subtitle: 'KPI and performance', icon: 'bar-chart-outline', route: 'Reports', tint: 'primary' },
  { title: 'Settings', subtitle: 'Organization defaults', icon: 'settings-outline', route: 'Settings', tint: 'default' }
];

export function MoreHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onNavigate = (route: RouteTarget) => {
    if (route === 'Students' || route === 'Enrollments' || route === 'Payments') {
      navigation.navigate('MainTabs', { screen: route });
      return;
    }
    navigation.navigate(route);
  };

  const renderTile = (tile: HubTile) => (
    <Pressable
      key={tile.title}
      style={({ pressed }) => [
        styles.tile,
        tile.tint === 'primary' && styles.tilePrimary,
        tile.tint === 'accent' && styles.tileAccent,
        pressed && styles.tilePressed
      ]}
      onPress={() => onNavigate(tile.route)}
    >
      <View style={[styles.tileIconWrap, tile.tint === 'accent' && styles.tileIconAccent]}>
        <Ionicons name={tile.icon} size={20} color={tile.tint === 'accent' ? theme.colors.accent : theme.colors.primary} />
      </View>
      <Text style={styles.tileTitle}>{tile.title}</Text>
      <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>
      <View style={styles.tileFooter}>
        <Text style={styles.tileFooterText}>Open</Text>
        <Ionicons name="arrow-forward" size={14} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <PageHeader
        title="Workspace"
        subtitle="Scrollable command center for every module, with clean gaps and production navigation flow."
      />

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Operations</Text>
        <View style={styles.grid}>{operationsTiles.map(renderTile)}</View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.grid}>{managementTiles.map(renderTile)}</View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Intelligence</Text>
        <View style={styles.grid}>{intelligenceTiles.map(renderTile)}</View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.sm
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
    textTransform: 'uppercase'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  tile: {
    width: '48%',
    minHeight: 108,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  tilePrimary: {
    backgroundColor: '#eef8f4',
    borderColor: '#c6e1d7'
  },
  tileAccent: {
    backgroundColor: '#fbf2e6',
    borderColor: '#e7cfad'
  },
  tilePressed: {
    transform: [{ scale: 0.985 }]
  },
  tileIconWrap: {
    width: 30,
    height: 30,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileIconAccent: {
    backgroundColor: theme.colors.accentSoft
  },
  tileTitle: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  tileSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  tileFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tileFooterText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  }
});
