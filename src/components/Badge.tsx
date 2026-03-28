import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { FONT_SIZE, SPACING, BORDER_RADIUS } from '@src/configs/theme';

interface BadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

const Badge = ({ label, color, backgroundColor, style, size = 'sm' }: BadgeProps) => {
  return (
    <View style={[styles.badge, { backgroundColor }, size === 'md' && styles.badgeMd, style]}>
      <Text style={[styles.text, { color }, size === 'md' && styles.textMd]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  textMd: {
    fontSize: FONT_SIZE.sm,
  },
});

export default React.memo(Badge);
