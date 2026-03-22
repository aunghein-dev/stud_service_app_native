import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Gap } from '@/components/layout/Gap';
import { theme } from '@/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  compact?: boolean;
  hideLabel?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  style?: StyleProp<ViewStyle>;
};

export function FormInput({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = 'default',
  compact = false,
  hideLabel = false,
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  style
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <Gap size={compact ? 'xxs' : 'xs'} style={style}>
      {!hideLabel ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={[
          styles.input,
          compact && styles.inputCompact,
          multiline && styles.inputMultiline,
          focused && styles.inputFocused,
          error && styles.inputError
        ]}
        keyboardType={keyboardType}
        placeholderTextColor={theme.colors.textSubtle}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Gap>
  );
}

const styles = StyleSheet.create({
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    ...theme.typography.body
  },
  inputCompact: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm
  },
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: 'top'
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceMuted
  },
  inputError: {
    borderColor: theme.colors.danger
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.danger
  }
});
