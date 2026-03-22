import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gap } from '@/components/layout/Gap';
import { theme } from '@/theme';

type Props = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <View style={styles.container}>
      <Gap size="sm" align="center">
        <View style={styles.pip} />
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </Gap>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.sm
  },
  pip: {
    width: 36,
    height: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.borderStrong
  },
  title: {
    ...theme.typography.subheading,
    color: theme.colors.text,
    textAlign: 'center'
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center'
  }
});
