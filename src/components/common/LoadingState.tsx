import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Gap } from '@/components/layout/Gap';
import { theme } from '@/theme';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.shell}>
      <Gap direction="row" align="center" size="sm" style={styles.badge}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={styles.text}>{label}</Text>
      </Gap>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl
  },
  badge: {
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.sm
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  }
});
