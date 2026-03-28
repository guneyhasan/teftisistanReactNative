import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Modal, Input, ConfirmDialog, EmptyState } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { Category, Question } from '@src/types';
import { categoryService } from '@modules/categories/services/categoryService';
import { useRefresh } from '@src/hooks/useRefresh';

const CategoriesScreen = () => {
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'question'; id: number } | null>(null);

  const [catName, setCatName] = useState('');
  const [qText, setQText] = useState('');
  const [qCatId, setQCatId] = useState<number | null>(null);
  const [qPoints, setQPoints] = useState('10');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const list = await categoryService.getAll();
      setCategories(list);
    } catch {
      Alert.alert('Hata', 'Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const { refreshing, handleRefresh } = useRefresh(fetchData);

  const handleCreateCategory = async () => {
    if (!catName.trim()) return;
    setCreating(true);
    try {
      await categoryService.create({ title: catName.trim() });
      setCatName('');
      setShowCatModal(false);
      await fetchData();
    } catch {
      Alert.alert('Hata', 'Oluşturulamadı.');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!qText.trim() || !qCatId) return;
    setCreating(true);
    try {
      await categoryService.createQuestion({ text: qText.trim(), categoryId: qCatId, points: Number(qPoints) || 10 });
      setQText('');
      setQPoints('10');
      setShowQModal(false);
      await fetchData();
    } catch {
      Alert.alert('Hata', 'Soru oluşturulamadı.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'category') {
        await categoryService.remove(deleteTarget.id);
      } else {
        await categoryService.removeQuestion(deleteTarget.id);
      }
      setDeleteTarget(null);
      await fetchData();
    } catch {
      Alert.alert('Hata', 'Silinemedi.');
    } finally {
      setDeleting(false);
    }
  };

  const renderCategory = useCallback(({ item }: { item: Category }) => {
    const isExpanded = expandedCat === item.id;
    const questions = item.questions || [];

    return (
      <View style={[styles.catCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
        <TouchableOpacity style={styles.catHeader} onPress={() => setExpandedCat(isExpanded ? null : item.id)}>
          <View style={styles.catLeft}>
            <Ionicons name={isExpanded ? 'chevron-down' : 'chevron-forward'} size={20} color={colors.textSecondary} />
            <Text style={[styles.catName, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.catCount, { color: colors.textTertiary }]}>({questions.length})</Text>
          </View>
          <View style={styles.catActions}>
            <TouchableOpacity onPress={() => { setQCatId(item.id); setShowQModal(true); }}>
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteTarget({ type: 'category', id: item.id })}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {isExpanded && questions.map((q) => (
          <View key={q.id} style={[styles.questionRow, { borderTopColor: colors.borderLight }]}>
            <View style={styles.qInfo}>
              <Text style={[styles.qText, { color: colors.text }]}>{q.text}</Text>
              <Text style={[styles.qMeta, { color: colors.textTertiary }]}>{q.points} puan {q.noteRequired ? '• Not zorunlu' : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => setDeleteTarget({ type: 'question', id: q.id })}>
              <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  }, [expandedCat, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Button title="Kategori Ekle" onPress={() => setShowCatModal(true)}
          icon={<Ionicons name="add" size={18} color={colors.white} />} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={<EmptyState icon="pricetag-outline" title="Kategori bulunamadı" />}
      />

      <Modal visible={showCatModal} onClose={() => setShowCatModal(false)} title="Yeni Kategori" size="sm">
        <Input label="Kategori Adı" value={catName} onChangeText={setCatName} placeholder="Kategori adı" />
        <Button title="Oluştur" onPress={handleCreateCategory} loading={creating} fullWidth />
      </Modal>

      <Modal visible={showQModal} onClose={() => setShowQModal(false)} title="Yeni Soru">
        <Input label="Soru Metni" value={qText} onChangeText={setQText} placeholder="Soru metnini girin" multiline />
        <Input label="Puan" value={qPoints} onChangeText={setQPoints} placeholder="10" keyboardType="numeric" />
        <Button title="Oluştur" onPress={handleCreateQuestion} loading={creating} fullWidth />
      </Modal>

      <ConfirmDialog visible={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Silme Onayı" message={deleteTarget?.type === 'category' ? 'Bu kategori ve tüm soruları silinecek.' : 'Bu soru silinecek.'}
        confirmLabel="Sil" loading={deleting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SPACING.lg, alignItems: 'flex-end' },
  list: { paddingHorizontal: SPACING.lg },
  catCard: { borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden' },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  catName: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  catCount: { fontSize: FONT_SIZE.sm },
  catActions: { flexDirection: 'row', gap: SPACING.md },
  questionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderTopWidth: 1,
  },
  qInfo: { flex: 1, marginRight: SPACING.sm },
  qText: { fontSize: FONT_SIZE.sm, lineHeight: 20 },
  qMeta: { fontSize: FONT_SIZE.xs, marginTop: 2 },
});

export default CategoriesScreen;
