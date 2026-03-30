import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { EmptyState, ConfirmDialog } from '@src/components';
import { SPACING } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { useAuthStore } from '@src/stores/authStore';
import { useAuditStore } from '@modules/audits/stores/auditStore';
import AuditListItem from '@modules/audits/components/AuditListItem';
import AuditFiltersComponent from '@modules/audits/components/AuditFilters';
import { Audit } from '@src/types';
import { useRefresh } from '@src/hooks/useRefresh';

const AuditListScreen = () => {
  const { colors } = useTheme();
  const { hasRole, user } = useAuthStore();
  const {
    audits,
    companies,
    fieldUsers,
    filters,
    loading,
    fetchAudits,
    fetchFilterData,
    setFilters,
    deleteAudit,
  } = useAuditStore();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { refreshing, handleRefresh } = useRefresh(fetchAudits);

  useEffect(() => {
    fetchFilterData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAudits();
    }, [fetchAudits])
  );

  const handleAuditPress = useCallback((audit: Audit) => {
    const isAssignedAuditor = audit.userId === user?.id;
    const isEditableStatus = ['draft', 'pending', 'revision_requested'].includes(audit.status);
    if (isAssignedAuditor && isEditableStatus) {
      router.push(`/(main)/audits/${audit.id}/answer`);
    } else {
      router.push(`/(main)/audits/${audit.id}/review`);
    }
  }, [user?.id]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAudit(deleteTarget);
      setDeleteTarget(null);
    } catch {
      Alert.alert('Hata', 'Denetim silinemedi.');
    } finally {
      setDeleting(false);
    }
  };

  const renderItem = useCallback(({ item }: { item: Audit }) => (
    <AuditListItem
      audit={item}
      onPress={() => handleAuditPress(item)}
      onDelete={hasRole('admin') ? () => setDeleteTarget(item.id) : undefined}
    />
  ), [handleAuditPress, hasRole]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filtersContainer}>
        <AuditFiltersComponent
          filters={filters}
          companies={companies}
          fieldUsers={fieldUsers}
          onFilterChange={setFilters}
        />
      </View>

      <FlatList
        data={audits}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="clipboard-outline"
              title="Denetim bulunamadı"
              description="Filtreleri değiştirmeyi deneyin"
            />
          ) : null
        }
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Denetimi Sil"
        message="Bu denetim kalıcı olarak silinecek. Devam etmek istiyor musunuz?"
        confirmLabel="Sil"
        loading={deleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filtersContainer: { padding: SPACING.lg, paddingBottom: 0 },
  list: { padding: SPACING.lg, paddingTop: SPACING.sm },
});

export default AuditListScreen;
