import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) => {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        variant_primary: { backgroundColor: colors.primary },
        variant_secondary: { backgroundColor: colors.secondary },
        variant_outline: { backgroundColor: colors.transparent, borderWidth: 1, borderColor: colors.primary },
        variant_danger: { backgroundColor: colors.danger },
        variant_ghost: { backgroundColor: colors.transparent },
        text_primary: { color: colors.white },
        text_secondary: { color: colors.white },
        text_outline: { color: colors.primary },
        text_danger: { color: colors.white },
        text_ghost: { color: colors.primary },
      }),
    [colors]
  );

  const containerStyle: ViewStyle[] = [
    styles.base,
    dynamicStyles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const labelStyle: TextStyle[] = [
    styles.text,
    dynamicStyles[`text_${variant}`],
    styles[`textSize_${size}`],
    isDisabled && styles.textDisabled,
    textStyle as TextStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={labelStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  size_sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  size_md: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  size_lg: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
  text: { fontWeight: '600' },
  textSize_sm: { fontSize: FONT_SIZE.sm },
  textSize_md: { fontSize: FONT_SIZE.md },
  textSize_lg: { fontSize: FONT_SIZE.lg },
  textDisabled: { opacity: 0.7 },
});

export default React.memo(Button);
