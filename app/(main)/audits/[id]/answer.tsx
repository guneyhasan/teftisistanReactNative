import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button, LoadingScreen, Select, AuthImage, Input } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { useAuthStore } from '@src/stores/authStore';
import { useAuditHeaderStore } from '@src/stores/auditHeaderStore';
import { Category, AnswerValue, Branch, Photo } from '@src/types';
import { auditService, AnswerPayload } from '@modules/audits/services/auditService';
import CategoryAccordion from '@modules/audits/components/CategoryAccordion';
import SignatureCanvas from '@modules/audits/components/SignatureCanvas';
import PhotoViewModal from '@modules/audits/components/PhotoViewModal';

interface AnswerMap {
  [questionId: number]: { value: AnswerValue | null; note: string };
}

type TabKey = 'all' | 'byCategory';

const AuditAnswerScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const setAuditHeaderTitle = useAuditHeaderStore((s) => s.setTitle);
  const clearAuditHeader = useAuditHeaderStore((s) => s.clear);
  const { id } = useLocalSearchParams<{ id: string }>();
  const auditId = id ?? '';

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const handleSaveRef = useRef<((silent?: boolean) => Promise<void>) | null>(null);
  const [authorizedPerson, setAuthorizedPerson] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [photosByQuestion, setPhotosByQuestion] = useState<Record<number, Photo[]>>({});
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureType, setSignatureType] = useState<'auditor' | 'client'>('auditor');
  const [auditorSignatureUrl, setAuditorSignatureUrl] = useState<string | null>(null);
  const [clientSignatureUrl, setClientSignatureUrl] = useState<string | null>(null);
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [revisionNote, setRevisionNote] = useState<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData();
  }, [auditId]);

  useEffect(() => {
    return () => clearAuditHeader();
  }, [clearAuditHeader]);

  usePreventRemove(hasUnsavedChanges, ({ data }) => {
    Alert.alert(
      'Kaydedilmemiş Değişiklikler',
      'Denetimi kaydetmedin. Kaydetmek ister misin?',
      [
        { text: 'İptal', style: 'cancel', onPress: () => {} },
        {
          text: 'Hayır',
          style: 'destructive',
          onPress: () => {
            setHasUnsavedChanges(false);
            navigation.dispatch(data.action);
          },
        },
        {
          text: 'Evet',
          onPress: async () => {
            await handleSaveRef.current?.(true);
            setHasUnsavedChanges(false);
            navigation.dispatch(data.action);
          },
        },
      ]
    );
  });

  const loadData = async () => {
    try {
      const [detail, cats, branchList] = await Promise.all([
        auditService.getAuditDetail(auditId),
        auditService.getCategories(),
        auditService.getBranches(),
      ]);

      setCategories(cats);
      setBranches(branchList);
      setSelectedBranch(detail.audit.branchId);

      const displayTitle =
        detail.audit.title ||
        detail.audit.branch?.name ||
        detail.audit.company?.name ||
        'Denetim';
      setAuditHeaderTitle(displayTitle);

      if (detail.audit.status === 'pending') {
        await auditService.startAudit(auditId);
      }

      if (detail.audit.answers) {
        const answerMap: AnswerMap = {};
        detail.audit.answers.forEach((a) => {
          answerMap[a.questionId] = { value: a.value, note: a.note || '' };
        });
        setAnswers(answerMap);
      }

      if (detail.audit.photos && detail.audit.photos.length > 0) {
        const pMap: Record<number, Photo[]> = {};
        detail.audit.photos.forEach((p) => {
          if (p.questionId) {
            if (!pMap[p.questionId]) pMap[p.questionId] = [];
            pMap[p.questionId].push(p);
          }
        });
        setPhotosByQuestion(pMap);
      } else {
        setPhotosByQuestion({});
      }

      if (detail.audit.auditorSignatureUrl) setAuditorSignatureUrl(detail.audit.auditorSignatureUrl);
      if (detail.audit.clientSignatureUrl) setClientSignatureUrl(detail.audit.clientSignatureUrl);
      if (detail.audit.authorizedPerson) setAuthorizedPerson(detail.audit.authorizedPerson);
      setRevisionNote(detail.audit.revisionNote || null);

      if (user?.signatureUrl && !detail.audit.auditorSignatureUrl) {
        try {
          const { url } = await auditService.useProfileSignature(auditId);
          setAuditorSignatureUrl(url);
        } catch {
          // Ignore - user can draw manually
        }
      }
    } catch {
      Alert.alert('Hata', 'Denetim verileri yüklenemedi.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = categories.reduce((sum, c) => sum + (c.questions?.length || 0), 0);
  const answeredCount = Object.values(answers).filter((a) => a.value).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave(true);
    }, 3000);
  }, [answers]);

  const handleValueChange = useCallback((questionId: number, value: AnswerValue) => {
    setHasUnsavedChanges(true);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], value, note: prev[questionId]?.note || '' },
    }));
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const handleNoteChange = useCallback((questionId: number, note: string) => {
    setHasUnsavedChanges(true);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], note, value: prev[questionId]?.value ?? null },
    }));
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const handlePhotoPress = useCallback(async (questionId: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const photo = await auditService.uploadPhoto(auditId, result.assets[0].uri, questionId);
        setPhotosByQuestion((prev) => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), photo],
        }));
      } catch {
        Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
      }
    }
  }, [auditId]);

  const handlePhotoView = useCallback((photo: Photo) => {
    setSelectedPhotoUrl(photo.url);
  }, []);

  const handleSave = useCallback(async (silent = false) => {
    const items: AnswerPayload[] = Object.entries(answers)
      .filter(([, a]) => a.value)
      .map(([qId, a]) => ({
        questionId: Number(qId),
        value: a.value!,
        note: a.note || undefined,
      }));

    if (items.length === 0) return;

    setSaving(true);
    try {
      await auditService.saveAnswers(auditId, items);
      setHasUnsavedChanges(false);
      if (!silent) Alert.alert('Başarılı', 'Cevaplar kaydedildi.');
    } catch {
      if (!silent) Alert.alert('Hata', 'Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }, [answers, auditId]);

  handleSaveRef.current = handleSave;

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      Alert.alert('Uyarı', 'Tüm soruları cevaplamanız gerekiyor.');
      return;
    }

    if (!auditorSignatureUrl || !clientSignatureUrl) {
      Alert.alert('Uyarı', 'Her iki imza da gerekli. Denetçi ve karşı taraf imzalarını atınız.');
      return;
    }

    if (!authorizedPerson?.trim()) {
      Alert.alert('Uyarı', 'Karşı taraf adı soyadı zorunludur.');
      return;
    }

    Alert.alert('Denetimi Gönder', 'Denetimi tamamlamak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Gönder',
        onPress: async () => {
          setSubmitting(true);
          try {
            await handleSave(true);
            await auditService.submitAudit(auditId, authorizedPerson.trim());
            Alert.alert('Başarılı', 'Denetim gönderildi.');
            router.replace('/(main)/audits');
          } catch {
            Alert.alert('Hata', 'Denetim gönderilemedi.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  const handleSignatureSave = async (dataUrl: string) => {
    setSignatureSaving(true);
    try {
      const { url } = await auditService.saveSignature(auditId, dataUrl, signatureType);
      if (signatureType === 'auditor') {
        setAuditorSignatureUrl(url);
      } else {
        setClientSignatureUrl(url);
      }
      setShowSignature(false);
    } catch {
      Alert.alert('Hata', 'İmza kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSignatureSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <View style={styles.progressSection}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {answeredCount}/{totalQuestions} soru ({Math.round(progress)}%)
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>
        <View style={styles.topActions}>
          {saving && <ActivityIndicator size="small" color={colors.primary} />}
          <Button title="Kaydet" variant="outline" size="sm" onPress={() => handleSave(false)} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!selectedBranch && branches.length > 0 && (
          <Select
            label="Şube Seçin"
            options={branches.map((b) => ({ label: `${b.name} - ${b.city}`, value: b.id }))}
            value={selectedBranch}
            onChange={(v) => setSelectedBranch(v as number)}
          />
        )}

        {revisionNote && (
          <View style={[styles.revisionNoteBanner, { backgroundColor: colors.warningLight }]}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
            <View style={styles.revisionNoteContent}>
              <Text style={[styles.revisionNoteTitle, { color: colors.text }]}>Revizyon Notu</Text>
              <Text style={[styles.revisionNoteText, { color: colors.textSecondary }]}>{revisionNote}</Text>
            </View>
          </View>
        )}

        <View style={[styles.tabBar, { backgroundColor: colors.surfaceVariant }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'all' && { backgroundColor: colors.surface, borderColor: colors.borderLight },
            ]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'all' ? colors.primary : colors.textSecondary }]}>
              Tüm Kategoriler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'byCategory' && { backgroundColor: colors.surface, borderColor: colors.borderLight },
            ]}
            onPress={() => setActiveTab('byCategory')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'byCategory' ? colors.primary : colors.textSecondary }]}>
              Kategori Seç
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'all' ? (
          categories.map((cat) => (
            <CategoryAccordion
              key={cat.id}
              category={cat}
              answers={answers}
              photosByQuestion={photosByQuestion}
              onValueChange={handleValueChange}
              onNoteChange={handleNoteChange}
              onPhotoPress={handlePhotoPress}
              onPhotoView={handlePhotoView}
            />
          ))
        ) : (
          <>
            <Select
              label="Soru Kategorisi"
              placeholder="Kategori seçin..."
              options={categories.map((cat) => {
                const qs = cat.questions || [];
                const answered = qs.filter((q) => answers[q.id]?.value).length;
                const pct = qs.length > 0 ? Math.round((answered / qs.length) * 100) : 0;
                return {
                  label: `${cat.title} (${pct}%)`,
                  value: cat.id,
                };
              })}
              value={selectedCategoryId}
              onChange={(v) => setSelectedCategoryId(v as number)}
            />
            {selectedCategoryId && (() => {
              const cat = categories.find((c) => c.id === selectedCategoryId);
              return cat ? (
                <CategoryAccordion
                  key={cat.id}
                  category={cat}
                  answers={answers}
                  photosByQuestion={photosByQuestion}
                  onValueChange={handleValueChange}
                  onNoteChange={handleNoteChange}
                  onPhotoPress={handlePhotoPress}
                  onPhotoView={handlePhotoView}
                  defaultExpanded
                />
              ) : null;
            })()}
          </>
        )}

        <Input
          label="Karşı Taraf Adı Soyadı"
          value={authorizedPerson}
          onChangeText={setAuthorizedPerson}
          containerStyle={styles.authorizedPersonInput}
          editable
        />

        <View style={styles.signatureSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İmzalar</Text>
          <View style={styles.signatureRow}>
            <TouchableOpacity
              style={[styles.signatureBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => { setSignatureType('auditor'); setShowSignature(true); }}
            >
              {auditorSignatureUrl ? (
                <AuthImage url={auditorSignatureUrl} style={styles.signaturePreview} resizeMode="contain" />
              ) : (
                <Ionicons name="create-outline" size={24} color={colors.textTertiary} />
              )}
              <Text style={[styles.signatureLabel, { color: colors.textSecondary }]}>Denetçi İmzası</Text>
              {auditorSignatureUrl && <Ionicons name="checkmark-circle" size={16} color={colors.success} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.signatureBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => { setSignatureType('client'); setShowSignature(true); }}
            >
              {clientSignatureUrl ? (
                <AuthImage url={clientSignatureUrl} style={styles.signaturePreview} resizeMode="contain" />
              ) : (
                <Ionicons name="create-outline" size={24} color={colors.textTertiary} />
              )}
              <Text style={[styles.signatureLabel, { color: colors.textSecondary }]}>Karşı Taraf İmzası</Text>
              {clientSignatureUrl && <Ionicons name="checkmark-circle" size={16} color={colors.success} />}
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Denetimi Gönder"
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
          size="lg"
          style={styles.submitBtn}
          disabled={!auditorSignatureUrl || !clientSignatureUrl || !authorizedPerson?.trim()}
        />
      </ScrollView>

      <SignatureCanvas
        visible={showSignature}
        onClose={() => setShowSignature(false)}
        onSave={handleSignatureSave}
        title={signatureType === 'auditor' ? 'Denetçi İmzası' : 'Karşı Taraf İmzası'}
        saving={signatureSaving}
      />

      <PhotoViewModal
        visible={!!selectedPhotoUrl}
        photoUrl={selectedPhotoUrl}
        onClose={() => setSelectedPhotoUrl(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  topBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressSection: { flex: 1, marginRight: SPACING.md },
  progressText: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl * 2 },
  revisionNoteBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  revisionNoteContent: { flex: 1 },
  revisionNoteTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: SPACING.xs },
  revisionNoteText: { fontSize: FONT_SIZE.sm, lineHeight: 20 },
  authorizedPersonInput: { marginTop: SPACING.lg },
  signatureSection: { marginTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', marginBottom: SPACING.md },
  signatureRow: { flexDirection: 'row', gap: SPACING.md },
  signatureBox: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  signatureLabel: { fontSize: FONT_SIZE.sm, textAlign: 'center' },
  signaturePreview: { width: 80, height: 40, marginBottom: SPACING.xs },
  submitBtn: { marginTop: SPACING.xl },
});

export default AuditAnswerScreen;
