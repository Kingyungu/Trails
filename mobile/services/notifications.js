import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions and register the device push token
 * with the server. Returns true if permissions granted, false otherwise.
 */
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    // Push notifications don't work on simulators
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await api.post('/auth/push-token', { token: tokenData.data });
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove this device's push token from the server (call on logout or
 * when the user disables notifications).
 */
export async function unregisterPushNotifications() {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await api.delete('/auth/push-token', { data: { token: tokenData.data } });
  } catch {
    // Best-effort
  }
}
