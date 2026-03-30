import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, AuthImage } from '@src/components';
import { SPACING, FONT_SIZE } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { AUDIT_STATUS_CONFIG } from '@src/configs/constants';
import { Audit } from '@src/types';

interface AuditSummaryCardProps {
  audit: Audit;
  score: number;
}

const formatDate = (dateStr: string | null | undefined) =>
  dateStr ? new Date(dateStr).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '-';

const getStatusDateLabelAndValue = (audit: Audit): { label: string; value: string } => {
  switch (audit.status) {
    case 'pending':
      return { label: 'Başlama', value: formatDate(audit.startedAt ?? audit.createdAt) };
    case 'draft':
      return { label: 'Başlama', value: formatDate(audit.startedAt ?? audit.createdAt) };
    case 'submitted':
      return { label: 'Gönderilme', value: formatDate(audit.submittedAt) };
    case 'revision_requested':
      return { label: 'Reddedilme', value: formatDate(audit.revisionRequestedAt ?? audit.updatedAt) };
    case 'approved':
      return { label: 'Onaylama', value: formatDate(audit.approvedAt) };
    default:
      return { label: 'Tarih', value: formatDate(audit.createdAt) };
  }
};

const AuditSummaryCard = ({ audit, score }: AuditSummaryCardProps) => {
  const { colors } = useTheme();
  const statusConfig = AUDIT_STATUS_CONFIG[audit.status] || AUDIT_STATUS_CONFIG.pending;
  const statusDate = getStatusDateLabelAndValue(audit);

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.scoreSection}>
        <View style={[styles.scoreCircle, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.scoreText, { color: colors.primary }]}>
            {Number.isFinite(score) ? Math.round(score) : '—'}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.primaryDark }]}>Puan</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <InfoRow icon="person-outline" label="Denetçi" value={audit.user?.email || '-'} colors={colors} />
        <InfoRow icon="business-outline" label="Şube" value={audit.branch?.name || '-'} colors={colors} />
        <InfoRow icon="calendar-outline" label="Oluşturulma" value={formatDate(audit.createdAt)} colors={colors} />
        <InfoRow icon="time-outline" label={statusDate.label} value={statusDate.value} colors={colors} />
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Ionicons name="flag-outline" size={16} color={colors.textTertiary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Durum</Text>
          </View>
          <Badge label={statusConfig.label} color={statusConfig.color} backgroundColor={statusConfig.bg} size="md" />
        </View>
      </View>

      <View style={[styles.signatureSection, { borderTopColor: colors.borderLight }]}>
        <Text style={[styles.signatureSectionTitle, { color: colors.textSecondary }]}>İmzalar</Text>
        <View style={styles.signatureRow}>
          <View style={[styles.signatureBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}>
            <Text style={[styles.signatureLabel, { color: colors.textSecondary }]}>Denetçi</Text>
            {audit.auditorSignatureUrl ? (
              <AuthImage url={audit.auditorSignatureUrl} style={styles.signatureImage} resizeMode="contain" />
            ) : (
              <Text style={[styles.signaturePlaceholder, { color: colors.textTertiary }]}>İmza yok</Text>
            )}
          </View>
          <View style={[styles.signatureBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}>
            <Text style={[styles.signatureLabel, { color: colors.textSecondary }]}>Şube Yetkilisi</Text>
            {audit.clientSignatureUrl ? (
              <AuthImage url={audit.clientSignatureUrl} style={styles.signatureImage} resizeMode="contain" />
            ) : (
              <Text style={[styles.signaturePlaceholder, { color: colors.textTertiary }]}>İmza yok</Text>
            )}
          </View>
        </View>
      </View>

      {audit.revisionNote && (
        <View style={[styles.revisionNote, { backgroundColor: colors.warningLight }]}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
          <Text style={[styles.revisionText, { color: colors.text }]}>{audit.revisionNote}</Text>
        </View>
      )}
    </Card>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Ionicons name={icon} size={16} color={colors.textTertiary} />
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
    <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: { padding: SPACING.lg },
  scoreSection: { alignItems: 'center', marginBottom: SPACING.lg },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: { fontSize: FONT_SIZE.xxl, fontWeight: '800' },
  scoreLabel: { fontSize: FONT_SIZE.xs },
  infoGrid: { gap: SPACING.md },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  infoLabel: { fontSize: FONT_SIZE.sm },
  infoValue: { fontSize: FONT_SIZE.sm, fontWeight: '500', maxWidth: '50%', textAlign: 'right' },
  signatureSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
  },
  signatureSectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  signatureRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  signatureBox: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
  },
  signatureImage: {
    width: '100%',
    height: 64,
  },
  signaturePlaceholder: {
    fontSize: FONT_SIZE.xs,
    fontStyle: 'italic',
    height: 64,
    lineHeight: 64,
    textAlign: 'center',
  },
  revisionNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 8,
  },
  revisionText: { fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 20 },
});

export default React.memo(AuditSummaryCard);
