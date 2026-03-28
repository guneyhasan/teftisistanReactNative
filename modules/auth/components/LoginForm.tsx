import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Input } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { TEST_USERS, USER_ROLES } from '@src/configs/constants';
import { useTheme } from '@src/contexts/ThemeContext';
import { useAuthStore } from '@src/stores/authStore';
import { authService } from '../services/authService';
import { LoginFormErrors } from '../types';

const LoginForm = () => {
  const { colors } = useTheme();
  const [firmaKodu, setFirmaKodu] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const setTenantApiUrl = useAuthStore((s) => s.setTenantApiUrl);

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};
    if (!firmaKodu.trim()) newErrors.firmaKodu = 'Firma kodu gerekli';
    if (!email.trim()) newErrors.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Geçersiz e-posta';
    if (!password) newErrors.password = 'Şifre gerekli';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const tenantUrl = await authService.getTenantUrl(firmaKodu.trim());
      if (!tenantUrl) {
        setErrors({ general: 'Firma kodu geçersiz veya sunucuya ulaşılamadı.' });
        setLoading(false);
        return;
      }
      await setTenantApiUrl(tenantUrl);

      await authService.getLoginCsrfToken();
      const response = await authService.login(email.trim(), password);
      const token = response.token || response.accessToken || '';
      await login(response.user, token, response.refreshToken);
      await authService.getAuthenticatedCsrfToken();
      router.replace('/(main)/dashboard');
    } catch (error: unknown) {
      const data = (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      const message =
        data?.message || data?.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      setErrors({ general: message });
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="shield-checkmark" size={48} color={colors.white} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>TeftişPro</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Denetim Yönetim Sistemi</Text>
        </View>

        <View style={styles.testSection}>
          <Text style={[styles.testSectionTitle, { color: colors.textSecondary }]}>
            Test hesapları (geliştirme)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testUserScroll}>
            {TEST_USERS.map((user) => (
              <TouchableOpacity
                key={user.email}
                style={[styles.testUserChip, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => {
                  setFirmaKodu('testfirma');
                  setEmail(user.email);
                  setPassword(user.password);
                  setErrors({});
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.testUserRole, { color: colors.text }]} numberOfLines={1}>
                  {USER_ROLES[user.role]}
                </Text>
                <Text style={[styles.testUserEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {user.email}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formSection}>
          {errors.general && (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.general}</Text>
            </View>
          )}

          <Input
            label="Firma Kodu"
            placeholder="Firma kodunuzu girin"
            value={firmaKodu}
            onChangeText={setFirmaKodu}
            error={errors.firmaKodu}
            autoCapitalize="none"
            leftIcon={<Ionicons name="business-outline" size={18} color={colors.textSecondary} />}
          />

          <Input
            label="E-posta"
            placeholder="ornek@sirket.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Şifre"
            placeholder="Şifrenizi girin"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            isPassword
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
          />

          <Button
            title="Giriş Yap"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.xxxl * 2,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
  },
  formSection: { width: '100%' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    flex: 1,
  },
  testSection: {
    marginBottom: SPACING.lg,
  },
  testSectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  testUserScroll: {
    marginHorizontal: -SPACING.xs,
  },
  testUserChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    minWidth: 120,
  },
  testUserRole: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  testUserEmail: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
});

export default LoginForm;
