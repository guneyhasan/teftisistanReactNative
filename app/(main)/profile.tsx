import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Input, Card, AuthImage } from '@src/components';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { USER_ROLES } from '@src/configs/constants';
import { useAuthStore } from '@src/stores/authStore';
import { useTheme } from '@src/contexts/ThemeContext';
import { profileService } from '@modules/profile/services/profileService';
import { authService } from '@modules/auth/services/authService';
import SignatureCanvas from '@modules/audits/components/SignatureCanvas';

const ProfileScreen = () => {
  const { user, setUser, logout } = useAuthStore();
  const { colors, colorScheme, setColorScheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const { url } = await profileService.uploadPhoto(result.assets[0].uri);
        if (user) {
          setUser({ ...user, profilePhoto: url });
        }
        Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi.');
      } catch {
        Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
      }
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Hata', 'Tüm alanlar zorunludur.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 12) {
      Alert.alert('Hata', 'Şifre en az 12 karakter olmalıdır.');
      return;
    }

    setPasswordLoading(true);
    try {
      await profileService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Başarılı', 'Şifreniz güncellendi.');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Şifre değiştirilemedi.';
      Alert.alert('Hata', msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignatureSave = async (dataUrl: string) => {
    try {
      const { url } = await profileService.saveSignature(dataUrl);
      if (user && url) {
        setUser({ ...user, signatureUrl: url });
      }
      setShowSignature(false);
      Alert.alert('Başarılı', 'İmza kaydedildi.');
    } catch {
      Alert.alert('Hata', 'İmza kaydedilemedi.');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Çıkış', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const isDark = colorScheme === 'dark';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Card variant="elevated" style={styles.profileCard}>
        <TouchableOpacity style={styles.avatarSection} onPress={handlePickPhoto}>
          {user?.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={40} color={colors.white} />
            </View>
          )}
          <View style={[styles.cameraIcon, { backgroundColor: colors.primaryDark, borderColor: colors.white }]}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </View>
        </TouchableOpacity>

        <Text style={[styles.email, { color: colors.text }]}>{user?.email || ''}</Text>
        <Text style={[styles.role, { color: colors.textSecondary }]}>{USER_ROLES[user?.role || ''] || user?.role}</Text>
      </Card>

      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Görünüm</Text>
        <View style={styles.themeRow}>
          <Text style={[styles.themeLabel, { color: colors.text }]}>Koyu mod</Text>
          <Switch
            value={isDark}
            onValueChange={(v) => setColorScheme(v ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={isDark ? colors.primary : colors.surfaceVariant}
          />
        </View>
      </Card>

      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Şifre Değiştir</Text>
        <Input
          label="Mevcut Şifre"
          placeholder="Mevcut şifreniz"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          isPassword
        />
        <Input
          label="Yeni Şifre"
          placeholder="En az 12 karakter"
          value={newPassword}
          onChangeText={setNewPassword}
          isPassword
        />
        <Input
          label="Yeni Şifre (Tekrar)"
          placeholder="Yeni şifrenizi tekrar girin"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
        />
        <Button
          title="Şifreyi Güncelle"
          onPress={handleChangePassword}
          loading={passwordLoading}
          fullWidth
        />
      </Card>

      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Varsayılan İmza</Text>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Denetimlerde kullanılacak varsayılan imzanızı çizin.
        </Text>
        <Button
          title="İmza Çiz"
          variant="outline"
          onPress={() => setShowSignature(true)}
          icon={<Ionicons name="create-outline" size={18} color={colors.primary} />}
        />
        {user?.signatureUrl && (
          <View style={[styles.signaturePreviewWrapper, { borderColor: colors.border }]}>
            <AuthImage url={user.signatureUrl} style={styles.signaturePreview} resizeMode="contain" />
          </View>
        )}
      </Card>

      <Button
        title="Çıkış Yap"
        variant="danger"
        onPress={handleLogout}
        fullWidth
        size="lg"
        icon={<Ionicons name="log-out-outline" size={18} color={colors.white} />}
        style={styles.logoutBtn}
      />

      <SignatureCanvas
        visible={showSignature}
        onClose={() => setShowSignature(false)}
        onSave={handleSignatureSave}
        title="Varsayılan İmza"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxxl * 2 },
  profileCard: { alignItems: 'center', padding: SPACING.xxl },
  avatarSection: { position: 'relative', marginBottom: SPACING.md },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
  },
  email: { fontSize: FONT_SIZE.lg, fontWeight: '600' },
  role: { fontSize: FONT_SIZE.md, marginTop: 2 },
  section: { padding: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', marginBottom: SPACING.md },
  sectionDesc: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.md, lineHeight: 20 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  themeLabel: { fontSize: FONT_SIZE.md },
  signaturePreviewWrapper: {
    width: '100%',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  signaturePreview: { width: '100%', height: 80 },
  logoutBtn: { marginTop: SPACING.sm },
});

export default ProfileScreen;
