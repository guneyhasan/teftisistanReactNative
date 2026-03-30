import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Button, Modal, Input, Select, ConfirmDialog, EmptyState, SearchBar, Badge } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { Branch, Company, Region } from '@src/types';
import { branchService } from '@modules/branches/services/branchService';
import { useRefresh } from '@src/hooks/useRefresh';

const BranchesScreen = () => {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ companyId?: string }>();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState<number | null>(null);
  const [filterRegion, setFilterRegion] = useState<number | null>(null);
  const [filterCity, setFilterCity] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // params.companyId değişince filtreyi güncelle (farklı şirketten gelinince)
  useEffect(() => {
    setFilterCompany(params.companyId ? parseInt(params.companyId, 10) : null);
    setFilterRegion(null);
  }, [params.companyId]);

  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState<number | null>(null);
  const [formRegion, setFormRegion] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [list, compList, regList] = await Promise.all([
        branchService.getAll({ companyId: filterCompany || undefined, regionId: filterRegion || undefined }),
        branchService.getCompanies(),
        branchService.getRegions(filterCompany || undefined),
      ]);
      setBranches(list);
      setCompanies(compList);
      setRegions(regList);
    } catch {
      Alert.alert('Hata', 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [filterCompany, filterRegion]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { refreshing, handleRefresh } = useRefresh(fetchData);

  const resetForm = () => {
    setFormName(''); setFormCity(''); setFormAddress(''); setFormPhone(''); setFormEmail('');
    setFormCompany(null); setFormRegion(null);
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formCity.trim() || !formCompany) {
      Alert.alert('Hata', 'Ad, şehir ve şirket gerekli.');
      return;
    }
    setCreating(true);
    try {
      await branchService.create({
        name: formName.trim(), city: formCity.trim(), companyId: formCompany,
        regionId: formRegion || undefined, address: formAddress || undefined,
        phone: formPhone || undefined, email: formEmail || undefined,
      });
      setShowModal(false);
      resetForm();
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
      await branchService.remove(deleteId);
      setDeleteId(null);
      await fetchData();
    } catch {
      Alert.alert('Hata', 'Silinemedi.');
    } finally {
      setDeleting(false);
    }
  };

  const uniqueCities = useMemo(() => {
    const cities = [...new Set(branches.map((b) => b.city).filter(Boolean))].sort();
    return cities;
  }, [branches]);

  const filtered = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase());
    const matchesCity = !filterCity || b.city === filterCity;
    return matchesSearch && matchesCity;
  });

  const handleFilterCompanyChange = (value: number) => {
    setFilterCompany(value === 0 ? null : value);
    setFilterRegion(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Şube ara..." style={styles.search} />
        <Button title="Yeni" onPress={() => setShowModal(true)} size="sm"
          icon={<Ionicons name="add" size={18} color={colors.white} />} />
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterTrigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setFiltersExpanded((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterTriggerText, { color: colors.text }]}>Filtreler</Text>
          <Ionicons
            name={filtersExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {filtersExpanded && (
          <View style={styles.filterContent}>
            <Select
              label="Şirket"
              placeholder="Tüm Şirketler"
              options={[{ label: 'Tüm Şirketler', value: 0 }, ...companies.map((c) => ({ label: c.name, value: c.id }))]}
              value={filterCompany ?? 0}
              onChange={(v) => handleFilterCompanyChange(v as number)}
            />
            <Select
              label="Bölge"
              placeholder="Tüm Bölgeler"
              options={[{ label: 'Tüm Bölgeler', value: 0 }, ...regions.map((r) => ({ label: r.name, value: r.id }))]}
              value={filterRegion ?? 0}
              onChange={(v) => setFilterRegion(v === 0 ? null : (v as number))}
            />
            <Select
              label="İl"
              placeholder="Tüm İller"
              options={[{ label: 'Tüm İller', value: '' }, ...uniqueCities.map((c) => ({ label: c, value: c }))]}
              value={filterCity ?? ''}
              onChange={(v) => setFilterCity(v === '' ? null : (v as string))}
            />
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={<EmptyState icon="storefront-outline" title="Şube bulunamadı" />}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: colors.surface }, SHADOWS.sm]}>
            <View style={styles.itemInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Badge label={item.isActive ? 'Aktif' : 'Pasif'}
                  color={item.isActive ? colors.success : colors.textTertiary}
                  backgroundColor={item.isActive ? colors.successLight : colors.surfaceVariant} />
              </View>
              <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{item.city} • {item.company?.name || '-'} • {item.region?.name || '-'}</Text>
            </View>
            <Button title="" variant="ghost" size="sm" onPress={() => setDeleteId(item.id)}
              icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />} />
          </View>
        )}
      />

      <Modal visible={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Yeni Şube" size="lg">
        <Select label="Şirket" options={companies.map((c) => ({ label: c.name, value: c.id }))} value={formCompany} onChange={(v) => setFormCompany(v as number)} />
        <Select label="Bölge (Opsiyonel)" placeholder="Seçin..."
          options={[{ label: 'Seçilmedi', value: 0 }, ...regions.filter((r) => !formCompany || r.companyId === formCompany).map((r) => ({ label: r.name, value: r.id }))]}
          value={formRegion || 0} onChange={(v) => setFormRegion(v === 0 ? null : (v as number))} />
        <Input label="Şube Adı" placeholder="Şube adı" value={formName} onChangeText={setFormName} />
        <Input label="Şehir" placeholder="Şehir" value={formCity} onChangeText={setFormCity} />
        <Input label="Adres" placeholder="Adres (opsiyonel)" value={formAddress} onChangeText={setFormAddress} />
        <Input label="Telefon" placeholder="Telefon (opsiyonel)" value={formPhone} onChangeText={setFormPhone} keyboardType="phone-pad" />
        <Input label="E-posta" placeholder="E-posta (opsiyonel)" value={formEmail} onChangeText={setFormEmail} keyboardType="email-address" />
        <Button title="Oluştur" onPress={handleCreate} loading={creating} fullWidth />
      </Modal>

      <ConfirmDialog visible={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Şubeyi Sil" message="Bu şube silinecek." confirmLabel="Sil" loading={deleting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.sm },
  filtersContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  filterTriggerText: { fontSize: FONT_SIZE.md, fontWeight: '500' },
  filterContent: { marginTop: SPACING.xs },
  search: { flex: 1 },
  list: { paddingHorizontal: SPACING.lg },
  item: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  itemInfo: { flex: 1, marginRight: SPACING.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  itemName: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  itemMeta: { fontSize: FONT_SIZE.xs, marginTop: 2 },
});

export default BranchesScreen;
