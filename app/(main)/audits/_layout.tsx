import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@src/contexts/ThemeContext';
import { FONT_SIZE } from '@src/configs/theme';

/**
 * Stack layout for audits section.
 * Enables iOS swipe-back gesture for answer and review screens.
 */
const AuditsLayout = () => {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: FONT_SIZE.lg },
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]/answer"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/review"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default AuditsLayout;
