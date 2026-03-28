import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Card, Select, EmptyState, LoadingScreen } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { AUDIT_STATUS_CONFIG } from '@src/configs/constants';
import { Audit, Company } from '@src/types';
import { reportService } from '@modules/reports/services/reportService';

const PRESETS = [
  { key: 'week', label: 'Bu Hafta' },
  { key: 'month', label: 'Bu Ay' },
  { key: '3months', label: 'Son 3 Ay' },
  { key: 'year', label: 'Bu Yıl' },
  { key: 'all', label: 'Tümü' },
];

const getPresetDates = (key: string): { start?: string; end?: string } => {
  const now = new Date();
  const start = new Date();

  switch (key) {
    case 'week': start.setDate(now.getDate() - 7); break;
    case 'month': start.setMonth(now.getMonth() - 1); break;
    case '3months': start.setMonth(now.getMonth() - 3); break;
    case 'year': start.setFullYear(now.getFullYear(), 0, 1); break;
    case 'all': return {};
  }

  return { start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
};

const screenWidth = Dimensions.get('window').width - SPACING.lg * 2;

const ReportsScreen = () => {
  const { colors } = useTheme();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState('month');
  const [companyId, setCompanyId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const dates = getPresetDates(preset);
      const [auditList, compList] = await Promise.all([
        reportService.getAudits({
          ...dates,
          companyId: companyId || undefined,
        }),
        reportService.getCompanies(),
      ]);
      setAudits(auditList);
      setCompanies(compList);
    } catch {
      Alert.alert('Hata', 'Rapor verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [preset, companyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredAudits = useMemo(() => {
    let list = [...audits];
    const dates = getPresetDates(preset);
    if (dates.start) {
      const start = new Date(dates.start);
      list = list.filter((a) => new Date(a.createdAt) >= start);
    }
    if (dates.end) {
      const end = new Date(dates.end + 'T23:59:59');
      list = list.filter((a) => new Date(a.createdAt) <= end);
    }
    if (companyId) {
      list = list.filter(
        (a) => a.companyId === companyId || a.branch?.company?.id === companyId || a.company?.id === companyId
      );
    }
    return list;
  }, [audits, preset, companyId]);

  const stats = useMemo(() => {
    const total = filteredAudits.length;
    const completed = filteredAudits.filter((a) => a.status === 'approved').length;
    const avgScore =
      total > 0
        ? Math.round(
            filteredAudits.reduce((sum, a) => sum + (a.score?.percent ?? 0), 0) / total
          )
        : 0;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, avgScore, rate };
  }, [filteredAudits]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAudits.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: AUDIT_STATUS_CONFIG[status]?.label || status,
      population: count,
      color: AUDIT_STATUS_CONFIG[status]?.color || colors.textTertiary,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    }));
  }, [filteredAudits, colors]);

  const monthlyTrend = useMemo(() => {
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentYear = new Date().getFullYear();
    const monthData = Array.from({ length: 12 }, (_, i) => ({ total: 0, score: 0 }));
    filteredAudits.forEach((a) => {
      const date = new Date(a.createdAt);
      if (date.getFullYear() === currentYear) {
        const m = date.getMonth();
        monthData[m].total++;
        monthData[m].score += a.score?.percent ?? 0;
      }
    });
    const avgScores = monthData.map((d) => (d.total > 0 ? Math.round(d.score / d.total) : 0));
    return {
      labels: monthNames,
      datasets: [{ data: avgScores, color: () => colors.primary, strokeWidth: 2 }],
    };
  }, [filteredAudits, colors]);

  const branchStats = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    filteredAudits.forEach((a) => {
      const name = a.branch?.name || 'Bilinmeyen';
      if (!map[name]) map[name] = { name, count: 0 };
      map[name].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredAudits]);

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.presetChip,
              { backgroundColor: colors.surfaceVariant },
              preset === p.key && { backgroundColor: colors.primary },
            ]}
            onPress={() => setPreset(p.key)}
          >
            <Text
              style={[
                styles.presetText,
                { color: colors.textSecondary },
                preset === p.key && { color: colors.white },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Select
        placeholder="Tüm Şirketler"
        options={[{ label: 'Tüm Şirketler', value: 0 }, ...companies.map((c) => ({ label: c.name, value: c.id }))]}
        value={companyId || 0}
        onChange={(v) => setCompanyId(v === 0 ? null : (v as number))}
      />

      <View style={styles.statsGrid}>
        <StatBox label="Toplam" value={String(stats.total)} color={colors.primary} textSecondary={colors.textSecondary} surfaceColor={colors.surface} />
        <StatBox label="Tamamlanan" value={String(stats.completed)} color={colors.success} textSecondary={colors.textSecondary} surfaceColor={colors.surface} />
        <StatBox label="Ort. Puan" value={`%${stats.avgScore}`} color={colors.info} textSecondary={colors.textSecondary} surfaceColor={colors.surface} />
        <StatBox label="Oran" value={`%${stats.rate}`} color={colors.warning} textSecondary={colors.textSecondary} surfaceColor={colors.surface} />
      </View>

      {statusDistribution.length > 0 && (
        <Card variant="elevated" style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Durum Dağılımı</Text>
          <PieChart
            data={statusDistribution}
            width={screenWidth - 32}
            height={180}
            chartConfig={{ color: () => colors.primary, labelColor: () => colors.text, backgroundGradientFrom: colors.surface, backgroundGradientTo: colors.surface }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </Card>
      )}

      {monthlyTrend.labels.length >= 1 && (
        <Card variant="elevated" style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Aylık Puan Trendi</Text>
          <LineChart
            data={monthlyTrend}
            width={screenWidth - 32}
            height={200}
            bezier
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: () => colors.textSecondary,
              propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
            }}
            style={{ borderRadius: 8 }}
          />
        </Card>
      )}

      {branchStats.length > 0 && (
        <Card variant="elevated" style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>En Çok Denetlenen Şubeler</Text>
          {branchStats.map((b, i) => (
            <View key={b.name} style={styles.branchRow}>
              <Text style={[styles.branchRank, { color: colors.primary }]}>#{i + 1}</Text>
              <Text style={[styles.branchName, { color: colors.text }]} numberOfLines={1}>{b.name}</Text>
              <Text style={[styles.branchCount, { color: colors.textSecondary }]}>{b.count}</Text>
            </View>
          ))}
        </Card>
      )}

      {filteredAudits.length === 0 && <EmptyState icon="bar-chart-outline" title="Veri bulunamadı" description="Filtrelerinizi değiştirin" />}
    </ScrollView>
  );
};

const StatBox = ({
  label,
  value,
  color,
  textSecondary,
  surfaceColor,
}: {
  label: string;
  value: string;
  color: string;
  textSecondary: string;
  surfaceColor: string;
}) => (
  <View style={[styles.statBox, { borderLeftColor: color, backgroundColor: surfaceColor }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: textSecondary }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxxl },
  presets: { flexDirection: 'row', marginBottom: SPACING.sm },
  presetChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  presetText: { fontSize: FONT_SIZE.sm, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statBox: {
    flex: 1, minWidth: '45%', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, borderLeftWidth: 3,
  },
  statValue: { fontSize: FONT_SIZE.xxl, fontWeight: '700' },
  statLabel: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  chartCard: { padding: SPACING.lg },
  chartTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', marginBottom: SPACING.md },
  branchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.sm },
  branchRank: { fontSize: FONT_SIZE.sm, fontWeight: '700', width: 24 },
  branchName: { fontSize: FONT_SIZE.sm, flex: 1 },
  branchCount: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
});

export default ReportsScreen;
