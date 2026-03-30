import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { ANSWER_VALUES } from '@src/configs/constants';
import { Question, AnswerValue, Photo } from '@src/types';
import { AuthImage } from '@src/components';

interface QuestionCardProps {
  question: Question;
  currentValue: AnswerValue | null;
  currentNote: string;
  onValueChange: (questionId: number, value: AnswerValue) => void;
  onNoteChange: (questionId: number, note: string) => void;
  onPhotoPress: (questionId: number) => void;
  onPhotoView?: (photo: Photo) => void;
  photos: Photo[];
  readonly?: boolean;
}

const ANSWER_BUTTONS: Array<{ key: AnswerValue; label: string; color: string }> = [
  { key: 'U', label: 'U', color: ANSWER_VALUES.U.color },
  { key: 'YP', label: 'YP', color: ANSWER_VALUES.YP.color },
  { key: 'UD', label: 'UD', color: ANSWER_VALUES.UD.color },
  { key: 'DD', label: 'DD', color: ANSWER_VALUES.DD.color },
];

const THUMBNAIL_SIZE = 56;

const QuestionCard = ({
  question,
  currentValue,
  currentNote,
  onValueChange,
  onNoteChange,
  onPhotoPress,
  onPhotoView,
  photos,
  readonly = false,
}: QuestionCardProps) => {
  const { colors } = useTheme();
  const showNoteInput = currentValue === 'UD' || question.noteRequired;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={styles.header}>
        <Text style={[styles.questionText, { color: colors.text }]}>{question.text}</Text>
        <Text style={[styles.points, { color: colors.textSecondary, backgroundColor: colors.surfaceVariant }]}>{question.points} puan</Text>
      </View>

      {question.description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{question.description}</Text>
      )}

      <View style={styles.answerRow}>
        {ANSWER_BUTTONS.map((btn) => {
          const isActive = currentValue === btn.key;
          return (
            <TouchableOpacity
              key={btn.key}
              style={[
                styles.answerBtn,
                { borderColor: btn.color },
                isActive && { backgroundColor: btn.color },
                readonly && { opacity: readonly && !isActive ? 0.4 : 1 },
              ]}
              onPress={readonly ? undefined : () => onValueChange(question.id, btn.key)}
              disabled={readonly}
            >
              <Text style={[styles.answerText, { color: colors.text }, isActive && { color: colors.white }]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showNoteInput && (
        <TextInput
          style={[
            styles.noteInput,
            { borderColor: colors.border, color: colors.text },
            readonly && { opacity: 0.6 },
          ]}
          placeholder="Not ekleyin..."
          placeholderTextColor={colors.textTertiary}
          value={currentNote}
          onChangeText={(text) => onNoteChange(question.id, text)}
          multiline
          numberOfLines={2}
          editable={!readonly}
        />
      )}

      {!readonly && (
        <TouchableOpacity style={styles.photoBtn} onPress={() => onPhotoPress(question.id)}>
          <Ionicons name="camera-outline" size={18} color={colors.primary} />
          <Text style={[styles.photoBtnText, { color: colors.primary }]}>
            Fotoğraf {photos.length > 0 ? `(${photos.length})` : 'Ekle'}
          </Text>
        </TouchableOpacity>
      )}
      {readonly && photos.length > 0 && (
        <View style={styles.photoBtn}>
          <Ionicons name="camera-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.photoBtnText, { color: colors.textSecondary }]}>
            Fotoğraflar ({photos.length})
          </Text>
        </View>
      )}

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailScroll}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {photos.map((photo) => (
            <AuthImage
              key={photo.id}
              url={photo.url}
              style={styles.thumbnail}
              resizeMode="cover"
              onPress={onPhotoView ? () => onPhotoView(photo) : undefined}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  questionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 22,
  },
  points: {
    fontSize: FONT_SIZE.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  answerRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  answerBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  answerText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  photoBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  thumbnailScroll: {
    marginTop: SPACING.sm,
    marginHorizontal: -SPACING.lg,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: BORDER_RADIUS.sm,
  },
});

export default React.memo(QuestionCard);
