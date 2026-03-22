import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

type DropdownValue = string | number;

export type DropdownOption = {
  value: DropdownValue;
  label: string;
  description?: string;
};

type Props = {
  label: string;
  value?: DropdownValue;
  options: DropdownOption[];
  onSelect: (value: DropdownValue) => void;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
};

export function DropdownSelect({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select option',
  helperText,
  disabled = false
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((option) => String(option.value) === String(value)),
    [options, value]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          disabled && styles.disabled,
          pressed && !disabled && styles.triggerPressed
        ]}
        onPress={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={styles.optionsWrap} contentContainerStyle={styles.optionsContent}>
              {options.map((option) => {
                const isSelected = String(option.value) === String(value);

                return (
                  <Pressable
                    key={String(option.value)}
                    style={[styles.option, isSelected && styles.optionActive]}
                    onPress={() => {
                      onSelect(option.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>{option.label}</Text>
                    {option.description ? <Text style={styles.optionDescription}>{option.description}</Text> : null}
                  </Pressable>
                );
              })}

              {!options.length ? <Text style={styles.emptyText}>No options available</Text> : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  trigger: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm
  },
  triggerPressed: {
    backgroundColor: theme.colors.surfaceMuted
  },
  triggerText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1
  },
  placeholder: {
    color: theme.colors.textSubtle
  },
  disabled: {
    opacity: 0.6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg
  },
  modalCard: {
    maxHeight: '70%',
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    ...theme.shadows.md
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  modalTitle: {
    ...theme.typography.subheading,
    color: theme.colors.text
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted
  },
  optionsWrap: {
    maxHeight: 380
  },
  optionsContent: {
    padding: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xxs
  },
  optionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  optionLabel: {
    ...theme.typography.bodyStrong,
    color: theme.colors.text
  },
  optionLabelActive: {
    color: theme.colors.primary
  },
  optionDescription: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
    textAlign: 'center',
    paddingVertical: theme.spacing.md
  },
  helper: {
    ...theme.typography.caption,
    color: theme.colors.danger
  }
});
