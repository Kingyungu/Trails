import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import useAuthStore from '../store/authStore';
import useOfflineStore from '../store/offlineStore';
import useSettingsStore from '../store/settingsStore';
import useSubscriptionStore from '../store/subscriptionStore';
import { registerForPushNotifications } from '../services/notifications';
import { COLORS } from '../constants/theme';

const sentryEnabled = !!process.env.EXPO_PUBLIC_SENTRY_DSN;

if (sentryEnabled) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableNative: true,
  });
}

function RootLayout() {
  const initAuth = useAuthStore((s) => s.initialize);
  const initOffline = useOfflineStore((s) => s.initialize);
  const initSettings = useSettingsStore((s) => s.initialize);
  const initSubscription = useSubscriptionStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const notifications = useSettingsStore((s) => s.notifications);

  useEffect(() => {
    initAuth();
    initOffline();
    initSettings();
  }, []);

  // Re-initialize subscription whenever auth state changes
  useEffect(() => {
    initSubscription();
  }, [user]);

  // Re-register push token whenever the user has notifications enabled
  // (handles app updates and token refreshes)
  useEffect(() => {
    if (notifications) {
      registerForPushNotifications();
    }
  }, [notifications]);

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
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
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
        <Stack.Screen
          name="auth/forgot-password"
          options={{
            title: 'Reset Password',
            presentation: 'modal',
            headerStyle: { backgroundColor: COLORS.secondarySystemBackground },
          }}
        />
        <Stack.Screen
          name="activity-history"
          options={{ title: 'Activity History' }}
        />
        <Stack.Screen name="privacy-policy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
        <Stack.Screen
          name="subscription"
          options={{
            title: 'Trails Premium',
            presentation: 'modal',
            headerStyle: { backgroundColor: COLORS.systemBackground },
          }}
        />
      </Stack>
    </>
  );
}

export default sentryEnabled ? Sentry.wrap(RootLayout) : RootLayout;