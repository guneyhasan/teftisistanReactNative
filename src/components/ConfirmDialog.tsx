import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { SPACING, FONT_SIZE } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

const ConfirmDialog = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Onayla',
  cancelLabel = 'İptal',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) => {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} onClose={onClose} title={title} size="sm">
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      <View style={styles.actions}>
        <Button title={cancelLabel} variant="ghost" onPress={onClose} style={styles.btn} />
        <Button
          title={confirmLabel}
          variant={variant}
          onPress={onConfirm}
          loading={loading}
          style={styles.btn}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  message: {
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  btn: { minWidth: 80 },
});

export default React.memo(ConfirmDialog);
