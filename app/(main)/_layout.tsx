import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@src/stores/authStore';
import { useAuditHeaderStore } from '@src/stores/auditHeaderStore';
import { useTheme } from '@src/contexts/ThemeContext';
import { MENU_ITEMS, USER_ROLES } from '@src/configs/constants';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@src/configs/theme';
import { authService } from '@modules/auth/services/authService';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  'clipboard-list': 'clipboard-outline',
  'chart-bar': 'bar-chart-outline',
  building: 'business-outline',
  map: 'map-outline',
  store: 'storefront-outline',
  tag: 'pricetag-outline',
  users: 'people-outline',
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user, logout, hasRole } = useAuthStore();
  const { colors } = useTheme();

  const filteredMenuItems = MENU_ITEMS.filter((item) =>
    item.roles.some((role) => hasRole(role)),
  );

  const handleLogout = async () => {
    await authService.logout();
    await logout();
    router.replace('/(auth)/login');
  };

  const drawerStyles = useMemo(
    () =>
      StyleSheet.create({
        userSection: {
          ...styles.userSection,
          borderBottomColor: colors.borderLight,
        },
        avatar: {
          ...styles.avatar,
          backgroundColor: colors.primary,
        },
        userName: { ...styles.userName, color: colors.text },
        userEmail: { ...styles.userEmail, color: colors.text },
        userRole: { ...styles.userRole, color: colors.textSecondary },
        menuLabel: { ...styles.menuLabel, color: colors.text },
        bottomSection: {
          ...styles.bottomSection,
          borderTopColor: colors.borderLight,
        },
        logoutText: { ...styles.logoutText, color: colors.danger },
      }),
    [colors]
  );

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
      <View style={drawerStyles.userSection}>
        <View style={drawerStyles.avatar}>
          {user?.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          )}
        </View>
        {user?.name ? (
          <Text style={drawerStyles.userName} numberOfLines={1}>{user.name}</Text>
        ) : null}
        <Text style={drawerStyles.userEmail} numberOfLines={1}>{user?.email || ''}</Text>
        <Text style={drawerStyles.userRole}>{USER_ROLES[user?.role || ''] || user?.role}</Text>
      </View>

      <View style={styles.menuSection}>
        {filteredMenuItems.map((item) => {
          const iconName = ICON_MAP[item.icon] || 'ellipse-outline';
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={() => router.push(item.route as never)}
            >
              <Ionicons name={iconName} size={22} color={colors.textSecondary} />
              <Text style={drawerStyles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(main)/profile' as never)}
        >
          <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
          <Text style={drawerStyles.menuLabel}>Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={[drawerStyles.menuLabel, drawerStyles.logoutText]}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const MainLayout = () => {
  const { colors } = useTheme();
  const auditHeaderTitle = useAuditHeaderStore((s) => s.title);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: FONT_SIZE.lg },
        drawerStyle: { width: 280, backgroundColor: colors.surface },
      }}
    >
      <Drawer.Screen name="dashboard" options={{ title: 'Kontrol Paneli' }} />
      <Drawer.Screen
        name="audits"
        options={({ route }) => {
          const focusedRoute = getFocusedRouteNameFromRoute(route) ?? 'index';
          const isOnDetailScreen = focusedRoute.includes('answer') || focusedRoute.includes('review');
          return {
            title: isOnDetailScreen ? (auditHeaderTitle || 'Denetim') : 'Denetimler',
            headerLeft: isOnDetailScreen
              ? () => (
                  <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                  </TouchableOpacity>
                )
              : undefined,
            swipeEnabled: !isOnDetailScreen,
            gestureEnabled: !isOnDetailScreen,
          };
        }}
      />
      <Drawer.Screen name="reports" options={{ title: 'Raporlar' }} />
      <Drawer.Screen name="admin/companies" options={{ title: 'Şirketler' }} />
      <Drawer.Screen name="admin/regions" options={{ title: 'Bölgeler' }} />
      <Drawer.Screen name="admin/branches" options={{ title: 'Şubeler' }} />
      <Drawer.Screen name="admin/categories" options={{ title: 'Kategoriler' }} />
      <Drawer.Screen name="admin/users" options={{ title: 'Kullanıcılar' }} />
      <Drawer.Screen name="profile" options={{ title: 'Profil', drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  headerBackBtn: {
    padding: 8,
    marginLeft: 4,
  },
  drawerContainer: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  userSection: {
    alignItems: 'center',
    paddingTop: SPACING.xl + 57, // ~1.5cm extra offset
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  userRole: {
    fontSize: FONT_SIZE.sm,
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 2,
  },
  menuLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.md,
  },
  logoutItem: {
    marginTop: SPACING.xs,
  },
  logoutText: {},
});

export default MainLayout;
