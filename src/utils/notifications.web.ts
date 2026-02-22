/**
 * Web-specific notifications implementation (stub)
 * Push notifications work differently on web and require service workers
 */

// Stub types
export const AndroidImportance = {
  UNKNOWN: 0,
  UNSPECIFIED: 1,
  NONE: 2,
  MIN: 3,
  LOW: 4,
  DEFAULT: 5,
  HIGH: 6,
  MAX: 7,
} as const;

export interface NotificationRequest {
  identifier: string;
  content: {
    title?: string | null;
    body?: string | null;
    data?: Record<string, any>;
  };
  trigger: any;
}

export interface NotificationPermissionsStatus {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain?: boolean;
}

// Set notification handler (no-op on web)
export function setNotificationHandler(_handler: any): void {
  // No-op
}

// Get permissions - always return granted for web (no native permissions needed)
export async function getPermissionsAsync(): Promise<NotificationPermissionsStatus> {
  // Check if browser supports notifications
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const permission = Notification.permission;
    return {
      status: permission === 'granted' ? 'granted' : permission === 'denied' ? 'denied' : 'undetermined',
      canAskAgain: permission !== 'denied',
    };
  }
  return { status: 'undetermined', canAskAgain: true };
}

// Request permissions
export async function requestPermissionsAsync(): Promise<NotificationPermissionsStatus> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const permission = await Notification.requestPermission();
    return {
      status: permission === 'granted' ? 'granted' : permission === 'denied' ? 'denied' : 'undetermined',
      canAskAgain: permission !== 'denied',
    };
  }
  return { status: 'undetermined', canAskAgain: true };
}

// Stub for notification channels (Android only)
export async function setNotificationChannelAsync(
  _channelId: string,
  _channel: any
): Promise<any> {
  return null;
}

// Schedule notification (stub - returns fake ID)
export async function scheduleNotificationAsync(_request: {
  content: any;
  trigger: any;
}): Promise<string> {
  console.log('[Notifications] Web notification scheduling not implemented');
  return `web-notification-${Date.now()}`;
}

// Cancel notifications (no-op)
export async function cancelScheduledNotificationAsync(_id: string): Promise<void> {
  // No-op
}

export async function cancelAllScheduledNotificationsAsync(): Promise<void> {
  // No-op
}

// Get scheduled notifications (returns empty)
export async function getAllScheduledNotificationsAsync(): Promise<NotificationRequest[]> {
  return [];
}
