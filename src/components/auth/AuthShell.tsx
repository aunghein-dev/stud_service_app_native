import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { Gap } from '@/components/layout/Gap';
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
        <Gap direction="row" justify="space-between" align="center" size="sm" style={styles.brandRow}>
          <BrandLogo size={58} showWordmark title="Stud Service App" subtitle="School ops and fee control" />
          <View style={styles.heroBadge}>
            <Ionicons name="layers-outline" size={13} color={theme.colors.primary} />
            <Text style={styles.heroBadgeText}>Multi-school workspace</Text>
          </View>
        </Gap>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Gap direction="row" wrap size="xs" style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Tenant auth</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>School branding</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>API protected</Text>
          </View>
        </Gap>
      </View>

      <View style={styles.card}>
        {children}
        <Gap direction="row" wrap align="center" justify="center" size="xs" style={styles.footerRow}>
          <Text style={styles.footerText}>{footerText}</Text>
          <Pressable onPress={onFooterActionPress} style={({ pressed }) => [styles.footerLink, pressed && styles.footerLinkPressed]}>
            <Text style={styles.footerLinkText}>{footerActionLabel}</Text>
          </Pressable>
        </Gap>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%'
  },
  hero: {
    borderRadius: 28,
    padding: theme.spacing.xl,
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
    minWidth: 0
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
    ...theme.shadows.md
  },
  footerRow: {
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
