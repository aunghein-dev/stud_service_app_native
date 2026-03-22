import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { brandAppName, brandLogoSvg, brandTagline } from '@/branding/logoSvg';
import { Gap } from '@/components/layout/Gap';
import { theme } from '@/theme';

type Props = {
  size?: number;
  showWordmark?: boolean;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
};

export function BrandLogo({
  size = 56,
  showWordmark = false,
  title = brandAppName,
  subtitle = brandTagline,
  style
}: Props) {
  return (
    <Gap direction="row" align="center" size="sm" style={style}>
      <View style={[styles.markWrap, { width: size, height: size, borderRadius: Math.max(Math.round(size * 0.34), theme.radii.md) }]}>
        <SvgXml xml={brandLogoSvg} width={size} height={size} />
      </View>
      {showWordmark ? (
        <Gap size="xxs" style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Gap>
      ) : null}
    </Gap>
  );
}

const styles = StyleSheet.create({
  markWrap: {
    overflow: 'hidden',
    ...theme.shadows.sm
  },
  copy: {
    flex: 1
  },
  title: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  }
});
