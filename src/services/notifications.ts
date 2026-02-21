/**
 * Local Notifications Service
 *
 * Handles scheduling local notifications for reminders, match alerts, etc.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification channels (Android)
const CHANNELS = {
  MATCHES: 'matches',
  STREAK: 'streak',
  DAILY_GOAL: 'daily_goal',
  RESULTS: 'results',
  PROMO: 'promo',
} as const;

// Storage keys
const STORAGE_KEYS = {
  SCHEDULED_NOTIFICATIONS: 'scheduled_notifications',
  NOTIFICATION_COUNT: 'daily_notification_count',
  LAST_NOTIFICATION_DATE: 'last_notification_date',
};

// Throttling config
const THROTTLE_CONFIG = {
  DAILY_LIMIT: 3,
  MIN_INTERVAL_MS: 2 * 60 * 60 * 1000, // 2 hours
  QUIET_START: 22, // 10 PM
  QUIET_END: 8, // 8 AM
};

// Urgent notification types (bypass throttling)
const URGENT_TYPES = ['match_starting', 'results', 'bet_won', 'live_odds'];

interface ScheduledNotification {
  id: string;
  type: string;
  scheduledAt: string;
}

class LocalNotificationsService {
  private static instance: LocalNotificationsService | null = null;
  private isInitialized = false;
  private lastNotificationTime = 0;

  private constructor() {}

  static getInstance(): LocalNotificationsService {
    if (!LocalNotificationsService.instance) {
      LocalNotificationsService.instance = new LocalNotificationsService();
    }
    return LocalNotificationsService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create notification channels on Android
    if (Platform.OS === 'android') {
      await this.createChannels();
    }

    this.isInitialized = true;
    console.log('[Notifications] Local notifications initialized');
  }

  private async createChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync(CHANNELS.MATCHES, {
      name: 'Matchs',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });

    await Notifications.setNotificationChannelAsync(CHANNELS.STREAK, {
      name: 'Série',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    await Notifications.setNotificationChannelAsync(CHANNELS.DAILY_GOAL, {
      name: 'Objectif quotidien',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    await Notifications.setNotificationChannelAsync(CHANNELS.RESULTS, {
      name: 'Résultats',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync(CHANNELS.PROMO, {
      name: 'Promotions',
      importance: Notifications.AndroidImportance.LOW,
    });
  }

  private async canSendNotification(type: string): Promise<boolean> {
    // Urgent notifications bypass throttling
    if (URGENT_TYPES.includes(type)) {
      return true;
    }

    // Check quiet hours
    const hour = new Date().getHours();
    if (hour >= THROTTLE_CONFIG.QUIET_START || hour < THROTTLE_CONFIG.QUIET_END) {
      console.log('[Notifications] In quiet hours, skipping non-urgent notification');
      return false;
    }

    // Check minimum interval
    const now = Date.now();
    if (now - this.lastNotificationTime < THROTTLE_CONFIG.MIN_INTERVAL_MS) {
      console.log('[Notifications] Too soon since last notification');
      return false;
    }

    // Check daily limit
    const today = new Date().toDateString();
    const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_NOTIFICATION_DATE);
    let count = 0;

    if (lastDate === today) {
      const countStr = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_COUNT);
      count = parseInt(countStr || '0', 10);
    } else {
      // New day, reset counter
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_NOTIFICATION_DATE, today);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_COUNT, '0');
    }

    if (count >= THROTTLE_CONFIG.DAILY_LIMIT) {
      console.log('[Notifications] Daily limit reached');
      return false;
    }

    return true;
  }

  private async recordNotification(): Promise<void> {
    this.lastNotificationTime = Date.now();

    const countStr = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_COUNT);
    const count = parseInt(countStr || '0', 10);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_COUNT, String(count + 1));
  }

  // Schedule a streak reminder for 8 PM
  async scheduleStreakReminder(): Promise<string | null> {
    const canSend = await this.canSendNotification('streak');
    if (!canSend) return null;

    const now = new Date();
    const trigger = new Date();
    trigger.setHours(20, 0, 0, 0);

    // If it's past 8 PM, schedule for tomorrow
    if (now > trigger) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Maintiens ta série !',
        body: 'Tu n\'as pas encore consulté de prédiction aujourd\'hui. Ne perds pas ta série !',
        data: { type: 'streak' },
      },
      trigger: {
        date: trigger,
        channelId: CHANNELS.STREAK,
      },
    });

    await this.recordNotification();
    console.log('[Notifications] Streak reminder scheduled for:', trigger);
    return id;
  }

  // Schedule a daily goal reminder for 6 PM
  async scheduleDailyGoalReminder(): Promise<string | null> {
    const canSend = await this.canSendNotification('daily_goal');
    if (!canSend) return null;

    const now = new Date();
    const trigger = new Date();
    trigger.setHours(18, 0, 0, 0);

    if (now > trigger) {
      trigger.setDate(trigger.getDate() + 1);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Objectif du jour',
        body: 'N\'oublie pas de compléter ton objectif quotidien !',
        data: { type: 'daily_goal' },
      },
      trigger: {
        date: trigger,
        channelId: CHANNELS.DAILY_GOAL,
      },
    });

    await this.recordNotification();
    return id;
  }

  // Schedule a match reminder (30 min before)
  async scheduleMatchReminder(
    matchId: number,
    homeTeam: string,
    awayTeam: string,
    matchTime: Date
  ): Promise<string | null> {
    const reminderTime = new Date(matchTime.getTime() - 30 * 60 * 1000);

    // Don't schedule if match is in the past
    if (reminderTime < new Date()) {
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚽ Match dans 30 minutes',
        body: `${homeTeam} vs ${awayTeam} - Consulte l'analyse IA !`,
        data: { type: 'match_starting', matchId },
      },
      trigger: {
        date: reminderTime,
        channelId: CHANNELS.MATCHES,
      },
    });

    console.log('[Notifications] Match reminder scheduled:', homeTeam, 'vs', awayTeam);
    return id;
  }

  // Send immediate notification for bet result
  async sendBetResult(
    tipId: string,
    matchTitle: string,
    won: boolean
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: won ? '🎉 Pari gagné !' : '😢 Pari perdu',
        body: won
          ? `${matchTitle} - Bravo, ton pari était gagnant !`
          : `${matchTitle} - Pas de chance, on se rattrapera !`,
        data: { type: 'results', tipId, won },
      },
      trigger: null, // Immediate
    });

    await this.recordNotification();
  }

  // Send level up celebration
  async sendLevelUp(newLevel: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎊 Niveau supérieur !',
        body: `Félicitations ! Tu es maintenant niveau ${newLevel} !`,
        data: { type: 'level_up', level: newLevel },
      },
      trigger: null,
    });
  }

  // Send streak milestone celebration
  async sendStreakMilestone(streak: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Série incroyable !',
        body: `${streak} jours consécutifs ! Continue comme ça !`,
        data: { type: 'streak_milestone', streak },
      },
      trigger: null,
    });
  }

  // Send daily goal completed
  async sendDailyGoalCompleted(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Objectif atteint !',
        body: 'Tu as complété ton objectif quotidien ! +25 XP',
        data: { type: 'daily_goal_complete' },
      },
      trigger: null,
    });
  }

  // Cancel a scheduled notification
  async cancelNotification(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All scheduled notifications cancelled');
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  }
}

export const localNotifications = LocalNotificationsService.getInstance();
