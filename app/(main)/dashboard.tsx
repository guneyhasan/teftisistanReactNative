import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@src/components';
import { SPACING } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { useAuthStore } from '@src/stores/authStore';
import { useDashboardStore } from '@modules/dashboard/stores/dashboardStore';
import StatCard from '@modules/dashboard/components/StatCard';
import AnnualChart from '@modules/dashboard/components/AnnualChart';
import RecentAuditsTable from '@modules/dashboard/components/RecentAuditsTable';
import NewAuditModal from '@modules/dashboard/components/NewAuditModal';

const DashboardScreen = () => {
  const { colors } = useTheme();
  const { hasRole } = useAuthStore();
  const {
    overview,
    annualStats,
    recentAudits,
    fieldUsers,
    branches,
    loading,
    fetchDashboardData,
    fetchFormData,
  } = useDashboardStore();
  const [showNewAudit, setShowNewAudit] = useState(false);
  const canCreateAudit = hasRole('admin', 'planlamacı');

  useEffect(() => {
    fetchDashboardData();
    if (canCreateAudit) {
      fetchFormData();
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchDashboardData();
    if (canCreateAudit) {
      await fetchFormData();
    }
  }, [fetchDashboardData, fetchFormData, canCreateAudit]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} colors={[colors.primary]} />
      }
    >
      {canCreateAudit && (
        <Button
          title="Yeni Denetim"
          onPress={async () => {
            await fetchFormData();
            setShowNewAudit(true);
          }}
          icon={<Ionicons name="add-circle-outline" size={18} color={colors.white} />}
          style={styles.newAuditBtn}
        />
      )}

      <View style={styles.statsGrid}>
        <StatCard
          title="Toplam Denetim"
          value={overview?.total ?? 0}
          icon="documents-outline"
          color={colors.primary}
          bgColor={colors.primaryLight}
        />
        <StatCard
          title="Bekleyen"
          value={(overview?.draft ?? 0) + (overview?.submitted ?? 0)}
          icon="time-outline"
          color={colors.warning}
          bgColor={colors.warningLight}
        />
        <StatCard
          title="Tamamlanan"
          value={overview?.approved ?? 0}
          icon="checkmark-circle-outline"
          color={colors.success}
          bgColor={colors.successLight}
        />
        <StatCard
          title="Tamamlanma"
          value={`%${overview?.completionRate ?? 0}`}
          icon="analytics-outline"
          color={colors.info}
          bgColor={colors.infoLight}
        />
      </View>

      <AnnualChart data={annualStats} />

      <RecentAuditsTable audits={recentAudits} />

      <NewAuditModal
        visible={showNewAudit}
        onClose={() => setShowNewAudit(false)}
        fieldUsers={fieldUsers}
        branches={branches}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxxl },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  newAuditBtn: { alignSelf: 'flex-end' },
});

export default DashboardScreen;
