import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import AuthImage from './AuthImage';

interface SelectOption {
  label: string;
  sublabel?: string;
  value: string | number;
  imageUrl?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  error?: string;
}

const AVATAR_SIZE = 28;

const Select = ({ label, placeholder = 'Seçiniz...', options, value, onChange, error }: SelectProps) => {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const renderOptionAvatar = (imageUrl?: string, addMargin = false) => (
    <View style={[styles.avatarWrapper, { backgroundColor: colors.surfaceVariant }, addMargin && styles.avatarMargin]}>
      {imageUrl ? (
        <AuthImage url={imageUrl} style={styles.avatar} resizeMode="cover" />
      ) : (
        <Ionicons name="person" size={AVATAR_SIZE * 0.5} color={colors.textSecondary} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.trigger,
          { borderColor: colors.border, backgroundColor: colors.surface },
          error && { borderColor: colors.danger },
        ]}
        onPress={() => setOpen(true)}
      >
        <View style={styles.triggerInner}>
          {selectedOption && options.some((o) => 'imageUrl' in o) && renderOptionAvatar(selectedOption.imageUrl)}
          <View style={styles.triggerContent}>
            {selectedOption ? (
              <>
                <Text style={[styles.triggerText, { color: colors.text }]}>{selectedOption.label}</Text>
                {selectedOption.sublabel && (
                  <Text style={[styles.triggerSublabel, { color: colors.textSecondary }]}>{selectedOption.sublabel}</Text>
                )}
              </>
            ) : (
              <Text style={[styles.triggerText, { color: colors.textTertiary }]}>{placeholder}</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.surface }, SHADOWS.lg]}>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && { backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  {options.some((o) => 'imageUrl' in o) && renderOptionAvatar(item.imageUrl, true)}
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.text },
                        item.value === value && { color: colors.primary, fontWeight: '600' },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.sublabel && (
                      <Text
                        style={[
                          styles.optionSublabel,
                          { color: colors.textSecondary },
                          item.value === value && { color: colors.primary },
                        ]}
                      >
                        {item.sublabel}
                      </Text>
                    )}
                  </View>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.list}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  triggerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  triggerContent: { flex: 1 },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarMargin: { marginRight: SPACING.sm },
  triggerText: { fontSize: FONT_SIZE.md },
  triggerSublabel: { fontSize: FONT_SIZE.sm, marginTop: 2 },
  error: { fontSize: FONT_SIZE.xs, marginTop: SPACING.xs },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    borderRadius: BORDER_RADIUS.lg,
    width: '85%',
    maxHeight: 350,
    padding: SPACING.sm,
  },
  list: { maxHeight: 330 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  optionContent: { flex: 1 },
  optionText: { fontSize: FONT_SIZE.md },
  optionSublabel: { fontSize: FONT_SIZE.sm, marginTop: 2 },
});

export default React.memo(Select);
