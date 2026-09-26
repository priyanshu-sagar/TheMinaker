import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@minaker/shared-types';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

/**
 * Root layout — checks auth state and redirects to the correct portal.
 * This is the single entry point for all 4 user roles.
 */
export default function RootLayout() {
  const { isLoaded, isSignedIn, role, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(gateman)" />
        <Stack.Screen name="(teacher)" />
        <Stack.Screen name="(parent)" />
        <Stack.Screen name="(gatekeeper)" />
        <Stack.Screen name="(conductor)" />
        <Stack.Screen name="(school-admin)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
