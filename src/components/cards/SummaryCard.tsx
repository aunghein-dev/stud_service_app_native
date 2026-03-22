import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

type Props = {
  label: string;
  value: string;
  tone?: 'primary' | 'accent' | 'default';
  onPress?: () => void;
};

export function SummaryCard({ label, value, tone = 'default', onPress }: Props) {
  const sharedStyle = [styles.container, tone === 'primary' && styles.primary, tone === 'accent' && styles.accent];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [sharedStyle, pressed ? styles.pressed : null]}
        onPress={onPress}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </Pressable>
    );
  }

  return (
    <View style={sharedStyle}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 132,
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
    ...theme.shadows.sm
  },
  primary: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary
  },
  accent: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  value: {
    ...theme.typography.heading,
    color: theme.colors.text
  },
  pressed: {
    transform: [{ scale: 0.985 }]
  }
});
