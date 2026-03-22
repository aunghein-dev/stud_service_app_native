import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'regular' | 'compact';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'regular',
  fullWidth = true,
  style
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'compact' && styles.compact,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        !fullWidth && styles.inline,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel,
          disabled && styles.disabledLabel
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 40,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  compact: {
    minHeight: 32,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm
  },
  inline: {
    alignSelf: 'flex-start'
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  secondary: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.borderStrong
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92
  },
  disabled: {
    opacity: 0.48
  },
  label: {
    ...theme.typography.button
  },
  primaryLabel: {
    color: theme.colors.onPrimary
  },
  secondaryLabel: {
    color: theme.colors.text
  },
  disabledLabel: {
    color: theme.colors.textSubtle
  }
});
