import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Modal, Button, Input, Select } from '@src/components';
import { SPACING } from '@src/configs/theme';
import { User, Branch } from '@src/types';
import { statsService } from '../services/statsService';

interface NewAuditModalProps {
  visible: boolean;
  onClose: () => void;
  fieldUsers: User[];
  branches: Branch[];
}

const NewAuditModal = ({ visible, onClose, fieldUsers, branches }: NewAuditModalProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const userOptions = fieldUsers.map((u) => ({
    label: u.name || '-',
    sublabel: u.email,
    value: u.id,
    imageUrl: u.profilePhoto || undefined,
  }));
  const branchOptions = branches.map((b) => ({ label: `${b.name} - ${b.city}`, value: b.id }));

  const handleCreate = async () => {
    if (!userId || !branchId) {
      Alert.alert('Hata', 'Denetçi ve şube seçimi zorunludur.');
      return;
    }
    setLoading(true);
    try {
      const audit = await statsService.createAudit({
        userId,
        branchId,
        title: title.trim() || undefined,
      });
      onClose();
      setUserId(null);
      setBranchId(null);
      setTitle('');
      router.push(`/(main)/audits/${audit.id}/answer`);
    } catch {
      Alert.alert('Hata', 'Denetim oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Yeni Denetim">
      <View style={styles.form}>
        <Select
          label="Denetçi"
          placeholder="Denetçi seçin..."
          options={userOptions}
          value={userId}
          onChange={(v) => setUserId(v as string)}
        />
        <Select
          label="Şube"
          placeholder="Şube seçin..."
          options={branchOptions}
          value={branchId}
          onChange={(v) => setBranchId(v as number)}
        />
        <Input
          label="Başlık (Opsiyonel)"
          placeholder="Denetim başlığı"
          value={title}
          onChangeText={setTitle}
        />
        <Button
          title="Denetim Oluştur"
          onPress={handleCreate}
          loading={loading}
          fullWidth
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: { paddingBottom: SPACING.md },
});

export default React.memo(NewAuditModal);
