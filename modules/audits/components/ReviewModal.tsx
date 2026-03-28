import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Modal, Button } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (action: 'approve' | 'reject', note: string) => void;
  loading: boolean;
}

const ReviewModal = ({ visible, onClose, onSubmit, loading }: ReviewModalProps) => {
  const { colors } = useTheme();
  const [note, setNote] = useState('');

  return (
    <Modal visible={visible} onClose={onClose} title="Denetim İnceleme">
      <Text style={[styles.label, { color: colors.text }]}>Not (Opsiyonel)</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="İnceleme notunuz..."
        placeholderTextColor={colors.textTertiary}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
      />
      <View style={styles.actions}>
        <Button
          title="Reddet"
          variant="danger"
          onPress={() => onSubmit('reject', note)}
          loading={loading}
          style={styles.btn}
        />
        <Button
          title="Onayla"
          onPress={() => onSubmit('approve', note)}
          loading={loading}
          style={styles.btn}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  btn: { minWidth: 100 },
});

export default React.memo(ReviewModal);
