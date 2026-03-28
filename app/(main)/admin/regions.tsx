import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Modal, Input, Select, ConfirmDialog, EmptyState } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { Region, Company } from '@src/types';
import { regionService } from '@modules/regions/services/regionService';
import { useRefresh } from '@src/hooks/useRefresh';

const RegionsScreen = () => {
  const { colors } = useTheme();
  const [regions, setRegions] = useState<Region[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [list, compList] = await Promise.all([
        regionService.getAll(filterCompanyId || undefined),
        regionService.getCompanies(),
      ]);
      setRegions(list);
      setCompanies(compList);
    } catch {
      Alert.alert('Hata', 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [filterCompanyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { refreshing, handleRefresh } = useRefresh(fetchData);

  const handleCreate = async () => {
    if (!name.trim() || !companyId) { Alert.alert('Hata', 'Bölge adı ve şirket gerekli.'); return; }
    setCreating(true);
    try {
      await regionService.create({ name: name.trim(), companyId });
      setShowModal(false);
      setName('');
      setCompanyId(null);
      await fetchData();
    } catch {
      Alert.alert('Hata', 'Oluşturulamadı.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await regionService.remove(deleteId);
      setDeleteId(null);
      await fetchData();
    } catch {
      Alert.alert('Hata', 'Silinemedi.');
    } finally {
      setDeleting(false);
    }
  };

  const companyOptions = [{ label: 'Tüm Şirketler', value: 0 }, ...companies.map((c) => ({ label: c.name, value: c.id }))];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Select
          placeholder="Şirket filtresi..."
          options={companyOptions}
          value={filterCompanyId || 0}
          onChange={(v) => setFilterCompanyId(v === 0 ? null : (v as number))}
        />
        <Button title="Yeni Bölge" onPress={() => setShowModal(true)} icon={<Ionicons name="add" size={18} color={colors.white} />} />
      </View>

      <FlatList
        data={regions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={<EmptyState icon="map-outline" title="Bölge bulunamadı" />}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: colors.surface }, SHADOWS.sm]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{item.company?.name || '-'} • {item._count?.branches ?? 0} şube</Text>
            </View>
            <Button title="" variant="ghost" size="sm" onPress={() => setDeleteId(item.id)}
              icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />} />
          </View>
        )}
      />

      <Modal visible={showModal} onClose={() => setShowModal(false)} title="Yeni Bölge">
        <Select label="Şirket" options={companies.map((c) => ({ label: c.name, value: c.id }))} value={companyId} onChange={(v) => setCompanyId(v as number)} />
        <Input label="Bölge Adı" placeholder="Bölge adı" value={name} onChangeText={setName} />
        <Button title="Oluştur" onPress={handleCreate} loading={creating} fullWidth />
      </Modal>

      <ConfirmDialog visible={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Bölgeyi Sil" message="Bu bölge silinecek." confirmLabel="Sil" loading={deleting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SPACING.lg, gap: SPACING.sm },
  list: { paddingHorizontal: SPACING.lg },
  item: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  itemMeta: { fontSize: FONT_SIZE.xs, marginTop: 2 },
});

export default RegionsScreen;
