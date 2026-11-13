import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { savePushToken } from './api';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
export async function registerForPushNotifications() {
  if (!Device.isDevice) return false;
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('household-reminders', { name: 'Household reminders', importance: AndroidImportance.HIGH });
  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (permission.status !== 'granted' || !projectId) return false;
  await savePushToken((await Notifications.getExpoPushTokenAsync({ projectId })).data, Platform.OS);
  return true;
}
