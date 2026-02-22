/**
 * Native notifications implementation using expo-notifications
 * For web builds, Metro/Expo automatically uses notifications.web.ts instead
 */

export {
  setNotificationHandler,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
  AndroidImportance,
} from 'expo-notifications';

export type { NotificationRequest } from 'expo-notifications';
