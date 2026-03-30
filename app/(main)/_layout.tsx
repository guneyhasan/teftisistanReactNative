import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthImage } from '@src/components';
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
import { companyService } from '@modules/companies/services/companyService';
import { Company } from '@src/types';

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
  const [companiesExpanded, setCompaniesExpanded] = useState(false);
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (isAdmin && companiesExpanded && companies.length === 0) {
      setLoadingCompanies(true);
      companyService.getAll()
        .then(setCompanies)
        .catch(() => {})
        .finally(() => setLoadingCompanies(false));
    }
  }, [companiesExpanded, isAdmin]);

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
            <AuthImage url={user.profilePhoto} style={styles.avatarImage} resizeMode="cover" />
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
          const isCompanies = item.key === 'companies';

          if (isCompanies) {
            return (
              <View key={item.key}>
                {/* Şirketler satırı: sol kısım sayfaya gider, sağ chevron listeyi açar/kapar */}
                <View style={styles.menuItemRow}>
                  <TouchableOpacity
                    style={styles.menuItemMain}
                    onPress={() => router.push(item.route as never)}
                  >
                    <Ionicons name={iconName} size={22} color={colors.textSecondary} />
                    <Text style={drawerStyles.menuLabel}>{item.label}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chevronBtn}
                    onPress={() => setCompaniesExpanded((prev) => !prev)}
                  >
                    <Ionicons
                      name={companiesExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Şirket alt listesi */}
                {companiesExpanded && (
                  <View style={styles.subList}>
                    {loadingCompanies ? (
                      <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 8 }} />
                    ) : companies.length === 0 ? (
                      <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Şirket bulunamadı</Text>
                    ) : (
                      companies.map((company) => (
                        <View key={company.id}>
                          {/* Şirket başlığı */}
                          <TouchableOpacity
                            style={[styles.companyRow, { borderLeftColor: colors.primary }]}
                            onPress={() =>
                              setExpandedCompanyId((prev) => (prev === company.id ? null : company.id))
                            }
                          >
                            <Ionicons name="business-outline" size={16} color={colors.primary} />
                            <Text style={[styles.companyLabel, { color: colors.text }]} numberOfLines={1}>
                              {company.name}
                            </Text>
                            <Ionicons
                              name={expandedCompanyId === company.id ? 'chevron-up' : 'chevron-down'}
                              size={14}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>

                          {/* Bölgeler & Şubeler */}
                          {expandedCompanyId === company.id && (
                            <View style={styles.subSubList}>
                              <TouchableOpacity
                                style={styles.subSubItem}
                                onPress={() =>
                                  router.push(`/(main)/admin/regions?companyId=${company.id}` as never)
                                }
                              >
                                <Ionicons name="map-outline" size={15} color={colors.textSecondary} />
                                <Text style={[styles.subSubLabel, { color: colors.textSecondary }]}>Bölgeler</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.subSubItem}
                                onPress={() =>
                                  router.push(`/(main)/admin/branches?companyId=${company.id}` as never)
                                }
                              >
                                <Ionicons name="storefront-outline" size={15} color={colors.textSecondary} />
                                <Text style={[styles.subSubLabel, { color: colors.textSecondary }]}>Şubeler</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          }

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
    paddingTop: SPACING.xl + 57,
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
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 2,
    overflow: 'hidden',
  },
  menuItemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  chevronBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  subList: {
    marginLeft: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderLeftWidth: 2,
    marginBottom: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  companyLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  subSubList: {
    marginLeft: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  subSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  subSubLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: FONT_SIZE.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
