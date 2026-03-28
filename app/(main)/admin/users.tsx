import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Modal, Input, Select, ConfirmDialog, EmptyState, SearchBar, Badge } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { USER_ROLES } from '@src/configs/constants';
import { User } from '@src/types';
import { userService } from '@modules/users/services/userService';
import { useRefresh } from '@src/hooks/useRefresh';

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  admin: { color: '#7c3aed', bg: '#ede9fe' },
  field: { color: '#059669', bg: '#d1fae5' },
  'planlamacı': { color: '#2563eb', bg: '#dbeafe' },
  'gözden_geçiren': { color: '#d97706', bg: '#fef3c7' },
  firma_sahibi: { color: '#dc2626', bg: '#fee2e2' },
  sube_kullanici: { color: '#64748b', bg: '#f1f5f9' },
};

const ROLE_OPTIONS = Object.entries(USER_ROLES).map(([value, label]) => ({ value, label }));

const UsersScreen = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const list = await userService.getAll();
      setUsers(list);
    } catch {
      Alert.alert('Hata', 'Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const { refreshing, handleRefresh } = useRefresh(fetchData);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password || !role) {
      Alert.alert('Hata', 'Tüm alanlar zorunludur.');
      return;
    }
    setCreating(true);
    try {
      await userService.create({ name: name.trim(), email: email.trim(), password, role });
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole(null);
      await fetchData();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Oluşturulamadı.';
      Alert.alert('Hata', msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await userService.remove(deleteId);
      setDeleteId(null);
      await fetchData();
    } catch {
      Alert.alert('Hata', 'Silinemedi.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  const roleStats = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Kullanıcı ara..." style={styles.search} />
        <Button title="Yeni" onPress={() => setShowModal(true)} size="sm"
          icon={<Ionicons name="person-add-outline" size={16} color={colors.white} />} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={<EmptyState icon="people-outline" title="Kullanıcı bulunamadı" />}
        renderItem={({ item }) => {
          const rc = ROLE_COLORS[item.role] || { color: colors.textSecondary, bg: colors.surfaceVariant };
          return (
            <View style={[styles.item, { backgroundColor: colors.surface }, SHADOWS.sm]}>
              <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{(item.name || item.email).charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name || '-'}</Text>
                <Text style={[styles.itemEmail, { color: colors.textSecondary }]} numberOfLines={1}>{item.email}</Text>
                <Badge label={USER_ROLES[item.role] || item.role} color={rc.color} backgroundColor={rc.bg} />
              </View>
              <Button title="" variant="ghost" size="sm" onPress={() => setDeleteId(item.id)}
                icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />} />
            </View>
          );
        }}
      />

      <Modal visible={showModal} onClose={() => setShowModal(false)} title="Yeni Kullanıcı">
        <Input label="Ad Soyad" placeholder="Örn: Ahmet Yılmaz" value={name} onChangeText={setName}
          autoCapitalize="words" />
        <Input label="E-posta" placeholder="ornek@sirket.com" value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" />
        <Input label="Şifre" placeholder="En az 12 karakter" value={password} onChangeText={setPassword} isPassword />
        <Select label="Rol" options={ROLE_OPTIONS} value={role} onChange={(v) => setRole(v as string)} />
        <Button title="Oluştur" onPress={handleCreate} loading={creating} fullWidth />
      </Modal>

      <ConfirmDialog visible={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Kullanıcıyı Sil" message="Bu kullanıcı kalıcı olarak silinecek." confirmLabel="Sil" loading={deleting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.sm },
  search: { flex: 1 },
  list: { paddingHorizontal: SPACING.lg },
  item: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  itemEmail: { fontSize: FONT_SIZE.sm, fontWeight: '400' },
});

export default UsersScreen;
