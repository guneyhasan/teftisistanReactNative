import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';
import { Category, AnswerValue, Photo } from '@src/types';
import QuestionCard from './QuestionCard';

interface AnswerMap {
  [questionId: number]: { value: AnswerValue | null; note: string };
}

interface CategoryAccordionProps {
  category: Category;
  answers: AnswerMap;
  photosByQuestion: Record<number, Photo[]>;
  onValueChange: (questionId: number, value: AnswerValue) => void;
  onNoteChange: (questionId: number, note: string) => void;
  onPhotoPress: (questionId: number) => void;
  onPhotoView?: (photo: Photo) => void;
  defaultExpanded?: boolean;
}

const CategoryAccordion = ({
  category,
  answers,
  photosByQuestion,
  onValueChange,
  onNoteChange,
  onPhotoPress,
  onPhotoView,
  defaultExpanded = false,
}: CategoryAccordionProps) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const questions = category.questions || [];
  const answeredCount = questions.filter((q) => answers[q.id]?.value).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.title, { color: colors.text }]}>{category.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {answeredCount}/{questions.length}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              currentValue={answers[question.id]?.value ?? null}
              currentNote={answers[question.id]?.note ?? ''}
              onValueChange={onValueChange}
              onNoteChange={onNoteChange}
              onPhotoPress={onPhotoPress}
              onPhotoView={onPhotoView}
              photos={photosByQuestion[question.id] || []}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
});

export default React.memo(CategoryAccordion);
