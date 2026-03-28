import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Button, Badge, Card, LoadingScreen, EmptyState } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { AUDIT_STATUS_CONFIG, ANSWER_VALUES } from '@src/configs/constants';
import { useAuthStore } from '@src/stores/authStore';
import { useAuditHeaderStore } from '@src/stores/auditHeaderStore';
import { Audit, Category, Answer, Photo } from '@src/types';
import { auditService } from '@modules/audits/services/auditService';
import AuditSummaryCard from '@modules/audits/components/AuditSummaryCard';
import ReviewModal from '@modules/audits/components/ReviewModal';
import PhotoViewModal from '@modules/audits/components/PhotoViewModal';
import { AuthImage } from '@src/components';

type TabKey = 'answers' | 'issues' | 'photos';

const TABS: Array<{ key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'answers', label: 'Cevaplar', icon: 'list-outline' },
  { key: 'issues', label: 'Sorunlar', icon: 'warning-outline' },
  { key: 'photos', label: 'Fotoğraflar', icon: 'images-outline' },
];

const AuditReviewScreen = () => {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const auditId = id ?? '';
  const { hasRole } = useAuthStore();
  const setAuditHeaderTitle = useAuditHeaderStore((s) => s.setTitle);
  const clearAuditHeader = useAuditHeaderStore((s) => s.clear);

  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [score, setScore] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('answers');
  const [showReview, setShowReview] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [expandedAnswerIds, setExpandedAnswerIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, [auditId]);

  useEffect(() => {
    return () => clearAuditHeader();
  }, [clearAuditHeader]);

  const loadData = async () => {
    try {
      const [detail, cats] = await Promise.all([
        auditService.getAuditDetail(auditId),
        auditService.getCategories(),
      ]);
      setAudit(detail.audit);
      const displayTitle =
        detail.audit.title ||
        detail.audit.branch?.name ||
        detail.audit.company?.name ||
        'Denetim';
      setAuditHeaderTitle(displayTitle);
      const displayScore =
        typeof detail.score === 'object' && detail.score !== null
          ? detail.score.percent
          : Number(detail.score) || 0;
      setScore(displayScore);
      setCategories(cats);
    } catch {
      Alert.alert('Hata', 'Denetim yüklenemedi.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const canReview = hasRole('admin', 'planlamacı', 'gözden_geçiren') && audit?.status === 'submitted';

  const issues = useMemo(() => {
    if (!audit?.answers) return [];
    return audit.answers.filter((a) => a.value === 'UD');
  }, [audit]);

  const handleReview = async (action: 'approve' | 'reject', note: string) => {
    setReviewing(true);
    try {
      await auditService.reviewAudit(auditId, action, note || undefined);
      Alert.alert('Başarılı', action === 'approve' ? 'Denetim onaylandı.' : 'Denetim reddedildi.');
      setShowReview(false);
      router.replace('/(main)/audits');
    } catch {
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
    } finally {
      setReviewing(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `TeftişPro - Denetim #${auditId.slice(0, 8)}\nPuan: ${Math.round(score)}\nDurum: ${AUDIT_STATUS_CONFIG[audit?.status || 'pending']?.label}`,
      });
    } catch {
      // User cancelled
    }
  };

  const questionMap = useMemo(() => {
    const map: Record<number, string> = {};
    categories.forEach((c) => {
      c.questions?.forEach((q) => {
        map[q.id] = q.text;
      });
    });
    return map;
  }, [categories]);

  const photosByQuestionId = useMemo(() => {
    const map: Record<number, Photo[]> = {};
    if (!audit?.photos) return map;
    audit.photos.forEach((p) => {
      if (p.questionId) {
        if (!map[p.questionId]) map[p.questionId] = [];
        map[p.questionId].push(p);
      }
    });
    return map;
  }, [audit?.photos]);

  const toggleExpanded = (answerId: number) => {
    setExpandedAnswerIds((prev) => {
      const next = new Set(prev);
      if (next.has(answerId)) next.delete(answerId);
      else next.add(answerId);
      return next;
    });
  };

  if (loading || !audit) return <LoadingScreen />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AuditSummaryCard audit={audit} score={score} />

        <View style={styles.actionRow}>
          {canReview && (
            <Button title="İncele" onPress={() => setShowReview(true)} style={styles.actionBtn} />
          )}
          <Button title="Paylaş" variant="outline" onPress={handleShare} style={styles.actionBtn}
            icon={<Ionicons name="share-outline" size={16} color={colors.primary} />}
          />
        </View>

        <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: colors.primaryLight },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.key ? colors.primary : colors.textTertiary}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textTertiary },
                  activeTab === tab.key && { color: colors.primary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'answers' && (
          <View style={styles.tabContent}>
            {audit.answers && audit.answers.length > 0 ? (
              audit.answers.map((answer) => {
                const answerConfig = ANSWER_VALUES[answer.value as keyof typeof ANSWER_VALUES];
                const questionPhotos = photosByQuestionId[answer.questionId] || [];
                const hasNote = answer.note && answer.note.trim().length > 0;
                const hasPhotos = questionPhotos.length > 0;
                const isUD = answer.value === 'UD';
                const hasDetails = isUD && (hasNote || hasPhotos);
                const isExpanded = expandedAnswerIds.has(answer.id);

                return (
                  <View key={answer.id} style={[styles.answerItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                    <View style={styles.answerHeader}>
                      <Text style={[styles.answerQuestion, { color: colors.text }]} numberOfLines={2}>
                        {questionMap[answer.questionId] || `Soru #${answer.questionId}`}
                      </Text>
                      <Badge
                        label={answerConfig?.short || answer.value}
                        color={colors.white}
                        backgroundColor={answerConfig?.color || colors.textTertiary}
                      />
                    </View>
                    {!isUD && hasNote && <Text style={[styles.answerNote, { color: colors.textSecondary }]}>{answer.note}</Text>}
                    {hasDetails && (
                      <TouchableOpacity
                        style={[styles.expandBtn, { backgroundColor: colors.surfaceVariant }]}
                        onPress={() => toggleExpanded(answer.id)}
                      >
                        <Ionicons
                          name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                          size={18}
                          color={colors.primary}
                        />
                        <Text style={[styles.expandBtnText, { color: colors.primary }]}>
                          {isExpanded ? 'Detayları gizle' : 'Fotoğraf ve notları göster'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {hasDetails && isExpanded && (
                      <View style={[styles.detailContent, { borderTopColor: colors.borderLight }]}>
                        {hasNote && <Text style={[styles.answerNote, { color: colors.textSecondary }]}>{answer.note}</Text>}
                        {hasPhotos && (
                          <View style={styles.photoThumbnailRow}>
                            {questionPhotos.map((photo) => (
                              <AuthImage
                                key={photo.id}
                                url={photo.url}
                                style={styles.photoThumbnail}
                                resizeMode="cover"
                                onPress={() => setSelectedPhotoUrl(photo.url)}
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <EmptyState icon="document-text-outline" title="Cevap bulunamadı" />
            )}
          </View>
        )}

        {activeTab === 'issues' && (
          <View style={styles.tabContent}>
            {issues.length > 0 ? (
              issues.map((issue) => {
                const questionPhotos = photosByQuestionId[issue.questionId] || [];
                const hasNote = issue.note && issue.note.trim().length > 0;
                const hasPhotos = questionPhotos.length > 0;
                const hasDetails = hasNote || hasPhotos;
                const isExpanded = expandedAnswerIds.has(issue.id);

                return (
                  <View key={issue.id} style={[styles.answerItem, styles.issueItem, { backgroundColor: colors.surface, borderColor: colors.borderLight, borderLeftColor: colors.danger }]}>
                    <Text style={[styles.answerQuestion, { color: colors.text }]}>
                      {questionMap[issue.questionId] || `Soru #${issue.questionId}`}
                    </Text>
                    {hasDetails && (
                      <TouchableOpacity
                        style={[styles.expandBtn, { backgroundColor: colors.surfaceVariant }]}
                        onPress={() => toggleExpanded(issue.id)}
                      >
                        <Ionicons
                          name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                          size={18}
                          color={colors.primary}
                        />
                        <Text style={[styles.expandBtnText, { color: colors.primary }]}>
                          {isExpanded ? 'Detayları gizle' : 'Fotoğraf ve notları göster'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {hasDetails && isExpanded && (
                      <View style={[styles.detailContent, { borderTopColor: colors.borderLight }]}>
                        {hasNote && <Text style={[styles.answerNote, { color: colors.textSecondary }]}>{issue.note}</Text>}
                        {hasPhotos && (
                          <View style={styles.photoThumbnailRow}>
                            {questionPhotos.map((photo) => (
                              <AuthImage
                                key={photo.id}
                                url={photo.url}
                                style={styles.photoThumbnail}
                                resizeMode="cover"
                                onPress={() => setSelectedPhotoUrl(photo.url)}
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <EmptyState icon="checkmark-circle-outline" title="Sorun bulunamadı" description="Tüm maddeler uygun" />
            )}
          </View>
        )}

        {activeTab === 'photos' && (
          <View style={styles.tabContent}>
            {audit.photos && audit.photos.length > 0 ? (
              <View style={styles.photoGrid}>
                {audit.photos.map((photo) => (
                  <AuthImage
                    key={photo.id}
                    url={photo.url}
                    style={styles.photo}
                    resizeMode="cover"
                    onPress={() => setSelectedPhotoUrl(photo.url)}
                  />
                ))}
              </View>
            ) : (
              <EmptyState icon="images-outline" title="Fotoğraf bulunamadı" />
            )}
          </View>
        )}
      </ScrollView>

      <ReviewModal
        visible={showReview}
        onClose={() => setShowReview(false)}
        onSubmit={handleReview}
        loading={reviewing}
      />

      <PhotoViewModal
        visible={!!selectedPhotoUrl}
        photoUrl={selectedPhotoUrl}
        onClose={() => setSelectedPhotoUrl(null)}
      />
    </View>
  );
};

const photoSize = (Dimensions.get('window').width - SPACING.lg * 2 - SPACING.sm * 2) / 3;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxxl },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    gap: SPACING.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '500' },
  tabContent: {},
  answerItem: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  issueItem: { borderLeftWidth: 3 },
  answerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.sm },
  answerQuestion: { fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 20 },
  answerNote: { fontSize: FONT_SIZE.sm, marginTop: SPACING.xs, fontStyle: 'italic' },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  expandBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '500' },
  detailContent: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  photoThumbnailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  photoThumbnail: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.sm,
  },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  photo: { width: photoSize, height: photoSize, borderRadius: BORDER_RADIUS.md },
});

export default AuditReviewScreen;
