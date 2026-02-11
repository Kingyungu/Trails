import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import useAuthStore from '../store/authStore';
import useOfflineStore from '../store/offlineStore';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  const initAuth = useAuthStore((s) => s.initialize);
  const initOffline = useOfflineStore((s) => s.initialize);

  useEffect(() => {
    initAuth();
    initOffline();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.systemBackground },
          headerTintColor: COLORS.tint,
          headerTitleStyle: { fontWeight: '600', fontSize: 17, color: COLORS.label },
          headerShadowVisible: true,
          contentStyle: { backgroundColor: COLORS.systemGroupedBackground },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="trail/[id]"
          options={{ headerTransparent: true, headerTitle: '' }}
        />
        <Stack.Screen name="tracking" options={{ title: 'Trail Tracking' }} />
        <Stack.Screen
          name="review/[trailId]"
          options={{
            title: 'Write Review',
            presentation: 'modal',
            headerStyle: { backgroundColor: COLORS.secondarySystemBackground },
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            title: 'Sign In',
            presentation: 'modal',
            headerStyle: { backgroundColor: COLORS.secondarySystemBackground },
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            title: 'Create Account',
            presentation: 'modal',
            headerStyle: { backgroundColor: COLORS.secondarySystemBackground },
          }}
        />
      </Stack>
    </>
  );
}
