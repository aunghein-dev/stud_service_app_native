import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { theme } from '@/theme';

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  palette?: 'login' | 'signup';
  footerText: string;
  footerActionLabel: string;
  onFooterActionPress: () => void;
  children: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  palette = 'login',
  footerText,
  footerActionLabel,
  onFooterActionPress,
  children
}: Props) {
  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <View style={[styles.hero, palette === 'signup' && styles.heroSignup]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>SSA</Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="layers-outline" size={13} color={theme.colors.primary} />
            <Text style={styles.heroBadgeText}>Multi-school workspace</Text>
          </View>
        </View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Tenant auth</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>School branding</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>API protected</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        {children}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{footerText}</Text>
          <Pressable onPress={onFooterActionPress} style={({ pressed }) => [styles.footerLink, pressed && styles.footerLinkPressed]}>
            <Text style={styles.footerLinkText}>{footerActionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg
  },
  hero: {
    borderRadius: 28,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
    backgroundColor: '#e7f1ea',
    borderWidth: 1,
    borderColor: '#cadacd',
    ...theme.shadows.md
  },
  heroSignup: {
    backgroundColor: '#f0ece4',
    borderColor: '#ddcdb5'
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandMarkText: {
    ...theme.typography.subheading,
    color: theme.colors.onPrimary
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: '#d3e2d8',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5
  },
  heroBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.primary
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.text
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs
  },
  pill: {
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: '#d7e2db'
  },
  pillText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    ...theme.shadows.md
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    paddingTop: theme.spacing.xs
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  },
  footerLink: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2
  },
  footerLinkPressed: {
    opacity: 0.7
  },
  footerLinkText: {
    ...theme.typography.bodyStrong,
    color: theme.colors.primary
  }
});
