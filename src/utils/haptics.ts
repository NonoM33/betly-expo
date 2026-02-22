/**
 * Native haptics implementation using expo-haptics
 * For web builds, Metro/Expo automatically uses haptics.web.ts instead
 */

export {
  impactAsync,
  notificationAsync,
  selectionAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from 'expo-haptics';
