import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/common/AppButton';
import { theme } from '@/theme';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onApply: () => void;
  placeholder?: string;
};

export function SearchFilterBar({ value, onChangeText, onApply, placeholder = 'Search' }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <Ionicons name="search-outline" size={14} color={theme.colors.textSubtle} />
          <TextInput
            value={value}
            placeholder={placeholder}
            onChangeText={onChangeText}
            style={styles.input}
            placeholderTextColor={theme.colors.textSubtle}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={onApply}
          />
          {value ? (
            <Pressable
              style={styles.clearButton}
              onPress={() => {
                onChangeText('');
                onApply();
              }}
            >
              <Ionicons name="close-circle" size={16} color={theme.colors.textSubtle} />
            </Pressable>
          ) : null}
        </View>
        <AppButton
          label="Go"
          onPress={onApply}
          variant="secondary"
          size="compact"
          fullWidth={false}
          style={styles.applyButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#f7fbf9',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: '#c8d8d0',
    padding: theme.spacing.xs
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 34
  },
  input: {
    flex: 1,
    paddingVertical: 6,
    color: theme.colors.text,
    ...theme.typography.body
  },
  clearButton: {
    padding: 1
  },
  applyButton: {
    minHeight: 34
  }
});
