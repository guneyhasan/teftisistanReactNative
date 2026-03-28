import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { useTheme } from '@src/contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

const Input = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  containerStyle,
  ...rest
}: InputProps) => {
  const { colors } = useTheme();
  const [secureEntry, setSecureEntry] = useState(isPassword);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: colors.border, backgroundColor: colors.surface },
          error && { borderColor: colors.danger },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          textContentType={isPassword ? 'password' : 'none'}
          autoComplete={isPassword ? 'password' : 'off'}
          placeholderTextColor={colors.textTertiary}
          {...rest}
          style={[styles.input, { color: colors.text }, leftIcon ? styles.inputWithIcon : undefined]}
          secureTextEntry={secureEntry}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setSecureEntry(!secureEntry)}
          >
            <Ionicons
              name={secureEntry ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
  },
  leftIcon: { paddingLeft: SPACING.md },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  inputWithIcon: { paddingLeft: SPACING.sm },
  eyeIcon: { padding: SPACING.md },
  error: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
});

export default React.memo(Input);
