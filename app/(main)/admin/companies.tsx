import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Modal, Input, Select, ConfirmDialog, EmptyState, SearchBar } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { Company, User } from '@src/types';
import { companyService } from '@modules/companies/services/companyService';
import { useRefresh } from '@src/hooks/useRefresh';

const CompaniesScreen = () => {
  const { colors } = useTheme();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [list, ownerList] = await Promise.all([
        companyService.getAll(),
        companyService.getOwners(),
      ]);
      setCompanies(list);
      setOwners(ownerList);
    } catch {
      Alert.alert('Hata', 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const { refreshing, handleRefresh } = useRefresh(fetchData);

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('Hata', 'Şirket adı gerekli.'); return; }
    setCreating(true);
    try {
      await companyService.create({ name: name.trim(), ownerId: ownerId || undefined });
      setShowModal(false);
      setName('');
      setOwnerId(null);
      await fetchData();
    } catch {
      Alert.alert('Hata', 'Şirket oluşturulamadı.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await companyService.remove(deleteId);
      setDeleteId(null);
      await fetchData();
    } catch {
      Alert.alert('Hata', 'Silinemedi.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = useCallback(({ item }: { item: Company }) => (
    <View style={[styles.item, { backgroundColor: colors.surface }, SHADOWS.sm]}>
      <View style={styles.itemHeader}>
        <View style={[styles.itemIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="business" size={20} color={colors.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
            {item._count?.regions ?? 0} bölge • {item._count?.branches ?? 0} şube
          </Text>
          {item.owner && <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{item.owner.email}</Text>}
        </View>
      </View>
      <Button
        title="Sil"
        variant="ghost"
        size="sm"
        onPress={() => setDeleteId(item.id)}
        icon={<Ionicons name="trash-outline" size={16} color={colors.danger} />}
        textStyle={{ color: colors.danger }}
      />
    </View>
  ), [colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Şirket ara..." style={styles.search} />
        <Button
          title="Yeni"
          onPress={() => setShowModal(true)}
          size="sm"
          icon={<Ionicons name="add" size={18} color={colors.white} />}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={<EmptyState icon="business-outline" title="Şirket bulunamadı" />}
      />

      <Modal visible={showModal} onClose={() => setShowModal(false)} title="Yeni Şirket">
        <Input label="Şirket Adı" placeholder="Şirket adını girin" value={name} onChangeText={setName} />
        <Select
          label="Firma Sahibi (Opsiyonel)"
          placeholder="Seçin..."
          options={[{ label: 'Seçilmedi', value: '' }, ...owners.map((o) => ({ label: o.email, value: o.id }))]}
          value={ownerId || ''}
          onChange={(v) => setOwnerId(v === '' ? null : (v as string))}
        />
        <Button title="Oluştur" onPress={handleCreate} loading={creating} fullWidth />
      </Modal>

      <ConfirmDialog
        visible={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Şirketi Sil"
        message="Bu şirket ve ilişkili tüm veriler silinecek."
        confirmLabel="Sil"
        loading={deleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.sm },
  search: { flex: 1 },
  list: { padding: SPACING.lg, paddingTop: 0 },
  item: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.md },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  itemMeta: { fontSize: FONT_SIZE.xs, marginTop: 2 },
});

export default CompaniesScreen;
