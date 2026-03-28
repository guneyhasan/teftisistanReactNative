import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, AuthImage } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { AUDIT_STATUS_CONFIG } from '@src/configs/constants';
import { Audit } from '@src/types';

interface AuditListItemProps {
  audit: Audit;
  onPress: () => void;
  onDelete?: () => void;
}

const AuditListItem = ({ audit, onPress, onDelete }: AuditListItemProps) => {
  const { colors } = useTheme();
  const statusConfig = AUDIT_STATUS_CONFIG[audit.status] || AUDIT_STATUS_CONFIG.pending;

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.surface }, SHADOWS.sm]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {audit.title || 'Denetim'}
          </Text>
        </View>
        <Badge
          label={statusConfig.label}
          color={statusConfig.color}
          backgroundColor={statusConfig.bg}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRowBetween}>
          <View style={[styles.detailRow, styles.detailRowLeft]}>
            {audit.branch && (
              <>
                <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {audit.branch.name} - {audit.branch.city}
                </Text>
              </>
            )}
          </View>
          <View style={[styles.detailRow, { flexShrink: 0 }]}>
            <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {audit.createdAt ? new Date(audit.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
            </Text>
          </View>
        </View>
        <View style={[styles.detailRow, styles.auditorRow]}>
          <View style={[styles.avatarWrapper, { backgroundColor: colors.surfaceVariant }]}>
            {audit.user?.profilePhoto ? (
              <AuthImage url={audit.user.profilePhoto} style={styles.avatar} resizeMode="cover" />
            ) : (
              <Ionicons name="person" size={12} color={colors.textSecondary} />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.detailText, { color: colors.text }]} numberOfLines={1}>
              {audit.user?.name || '-'}
            </Text>
            <Text style={[styles.detailText, styles.detailSubtext, { color: colors.textSecondary }]} numberOfLines={1}>
              {audit.user?.email || '-'}
            </Text>
          </View>
        </View>
      </View>

      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    flex: 1,
  },
  details: { gap: SPACING.xs },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailRowLeft: {
    flex: 1,
    minWidth: 0,
  },
  auditorRow: {
    marginTop: SPACING.sm,
  },
  avatarWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  userInfo: { flex: 1 },
  detailText: {
    fontSize: FONT_SIZE.sm,
  },
  detailSubtext: {
    fontSize: FONT_SIZE.xs,
    marginTop: 1,
  },
  deleteBtn: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
  },
});

export default React.memo(AuditListItem);
