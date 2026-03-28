import React, { useEffect } from 'react';
import { Slot, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '@src/stores/authStore';
import { useThemeStore } from '@src/stores/themeStore';
import { ThemeProvider, useTheme } from '@src/contexts/ThemeContext';
import { authService } from '@modules/auth/services/authService';
import { LoadingScreen } from '@src/components';

const RootLayout = () => {
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();
  const loadStoredTheme = useThemeStore((s) => s.loadStoredTheme);
  const segments = useSegments();

  useEffect(() => {
    loadStoredAuth();
    loadStoredTheme();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      authService.getAuthenticatedCsrfToken().catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(main)/dashboard');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <ThemeProvider>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <StatusBarWrapper />
            <Slot />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      )}
    </ThemeProvider>
  );
};

const StatusBarWrapper = () => {
  const { colorScheme } = useTheme();
  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default RootLayout;
