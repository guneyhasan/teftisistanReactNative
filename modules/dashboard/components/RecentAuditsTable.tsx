import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Card, Badge } from '@src/components';
import { SPACING, FONT_SIZE } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { AUDIT_STATUS_CONFIG } from '@src/configs/constants';
import { Audit } from '@src/types';

interface RecentAuditsTableProps {
  audits: Audit[];
}

const AuditRow = ({ item, colors }: { item: Audit; colors: ReturnType<typeof useTheme>['colors'] }) => {
  const statusConfig = AUDIT_STATUS_CONFIG[item.status] || AUDIT_STATUS_CONFIG.pending;

  const handlePress = () => {
    const isEditableStatus = ['draft', 'pending', 'revision_requested'].includes(item.status);
    if (isEditableStatus) {
      router.push(`/(main)/audits/${item.id}/answer`);
    } else {
      router.push(`/(main)/audits/${item.id}/review`);
    }
  };

  return (
    <TouchableOpacity style={styles.row} onPress={handlePress}>
      <View style={styles.rowHeader}>
        <Text style={[styles.auditTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title || `Denetim #${item.id.slice(0, 8)}`}
        </Text>
        <Badge
          label={statusConfig.label}
          color={statusConfig.color}
          backgroundColor={statusConfig.bg}
        />
      </View>
      <View style={styles.rowMeta}>
        <Text style={[styles.metaText, { color: colors.textTertiary }]}>
          {item.user?.email || '-'}
        </Text>
        <Text style={[styles.metaText, { color: colors.textTertiary }]}>
          {item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const RecentAuditsTable = ({ audits }: RecentAuditsTableProps) => {
  const { colors } = useTheme();
  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Son Denetimler</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/audits')}>
          <Text style={[styles.viewAll, { color: colors.primary }]}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>
      {audits.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textTertiary }]}>Henüz denetim bulunmuyor</Text>
      ) : (
        <FlatList
          data={audits.slice(0, 5)}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <AuditRow item={item} colors={colors} />}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { padding: SPACING.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  row: {
    paddingVertical: SPACING.sm,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  auditTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    flex: 1,
    marginRight: SPACING.sm,
  },
  rowMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
  },
  separator: {
    height: 1,
  },
  empty: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
});

export default React.memo(RecentAuditsTable);
