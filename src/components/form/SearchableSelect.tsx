import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '@/theme';

type SelectOption = {
  id: number;
  title: string;
  subtitle?: string;
};

type Props = {
  label: string;
  placeholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedId?: number;
  selectedLabel?: string;
  options: SelectOption[];
  onSelect: (id: number) => void;
  helperText?: string;
  loading?: boolean;
};

export function SearchableSelect({
  label,
  placeholder = 'Search...',
  searchValue,
  onSearchChange,
  selectedId,
  selectedLabel,
  options,
  onSelect,
  helperText,
  loading = false
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder={placeholder}
        style={styles.searchInput}
        placeholderTextColor={theme.colors.textSubtle}
      />
      {selectedId ? (
        <View style={styles.selectedWrap}>
          <Text style={styles.selectedText}>Selected: {selectedLabel || `#${selectedId}`}</Text>
        </View>
      ) : null}
      <View style={styles.listWrap}>
        {loading ? <Text style={styles.helper}>Searching...</Text> : null}
        {!loading && options.length === 0 ? <Text style={styles.helper}>No matches</Text> : null}
        {!loading
          ? options.slice(0, 12).map((item) => (
              <Pressable key={item.id} style={styles.option} onPress={() => onSelect(item.id)}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                {item.subtitle ? <Text style={styles.optionSubtitle}>{item.subtitle}</Text> : null}
              </Pressable>
            ))
          : null}
      </View>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    ...theme.typography.body
  },
  selectedWrap: {
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  selectedText: {
    ...theme.typography.caption,
    color: theme.colors.text
  },
  listWrap: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    maxHeight: 220,
    overflow: 'hidden'
  },
  option: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  optionTitle: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text
  },
  optionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  helper: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  }
});
