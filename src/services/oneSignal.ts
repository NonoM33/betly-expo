/**
 * OneSignal Push Notifications Service
 *
 * Handles remote push notifications via OneSignal
 * In production, use react-native-onesignal package
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushService } from '../api/services';
import { deepLinks } from './deepLinks';

// Configuration
const CONFIG = {
  APP_ID: '13a823e7-8b35-4cc6-b8e2-8b96b7904303',
};

// Storage keys
const STORAGE_KEYS = {
  PLAYER_ID: 'onesignal_player_id',
  TAGS: 'onesignal_tags',
};

export interface NotificationData {
  type: string;
  matchId?: number;
  tipId?: string;
  url?: string;
  [key: string]: any;
}

class OneSignalService {
  private static instance: OneSignalService | null = null;
  private isInitialized = false;
  private playerId: string | null = null;
  private OneSignal: any = null;

  private constructor() {}

  static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import OneSignal
      // In production: import OneSignal from 'react-native-onesignal';
      // this.OneSignal = require('react-native-onesignal').default;

      // OneSignal.setAppId(CONFIG.APP_ID);
      // await this.setupNotificationHandlers();

      // Load stored player ID
      this.playerId = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_ID);

      this.isInitialized = true;
      console.log('[OneSignal] Initialized with App ID:', CONFIG.APP_ID);
    } catch (error) {
      console.warn('[OneSignal] Failed to initialize:', error);
    }
  }

  private async setupNotificationHandlers(): Promise<void> {
    if (!this.OneSignal) return;

    // Handle notification opened
    // this.OneSignal.setNotificationOpenedHandler((notification: any) => {
    //   const data = notification.notification.additionalData as NotificationData;
    //   this.handleNotificationAction(data);
    // });

    // Handle notification received in foreground
    // this.OneSignal.setNotificationWillShowInForegroundHandler((event: any) => {
    //   const notification = event.getNotification();
    //   event.complete(notification);
    // });
  }

  private handleNotificationAction(data: NotificationData): void {
    if (!data) return;

    console.log('[OneSignal] Notification action:', data);

    switch (data.type) {
      case 'match':
        if (data.matchId) {
          deepLinks.handleUrl(`/match/${data.matchId}`);
        }
        break;
      case 'tip':
        if (data.tipId) {
          deepLinks.handleUrl(`/tip/${data.tipId}`);
        }
        break;
      case 'credits':
        deepLinks.handleUrl('/credits');
        break;
      case 'pricing':
        deepLinks.handleUrl('/pricing');
        break;
      case 'streak':
        // Navigate to home/feed
        deepLinks.handleUrl('/');
        break;
      case 'url':
        if (data.url) {
          deepLinks.handleUrl(data.url);
        }
        break;
      default:
        console.log('[OneSignal] Unknown notification type:', data.type);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      // const granted = await this.OneSignal.promptForPushNotificationsWithUserResponse();
      console.log('[OneSignal] Permission requested');
      return true;
    } catch (error) {
      console.error('[OneSignal] Permission request failed:', error);
      return false;
    }
  }

  async getPlayerId(): Promise<string | null> {
    if (this.playerId) return this.playerId;

    try {
      // const deviceState = await this.OneSignal.getDeviceState();
      // this.playerId = deviceState?.userId || null;

      if (this.playerId) {
        await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_ID, this.playerId);
      }

      return this.playerId;
    } catch (error) {
      console.error('[OneSignal] Failed to get player ID:', error);
      return null;
    }
  }

  async registerWithBackend(userId: string): Promise<void> {
    const playerId = await this.getPlayerId();
    if (!playerId) {
      console.warn('[OneSignal] No player ID available');
      return;
    }

    try {
      await pushService.register(playerId);
      console.log('[OneSignal] Registered with backend');
    } catch (error) {
      console.error('[OneSignal] Failed to register with backend:', error);
    }
  }

  async unregisterFromBackend(): Promise<void> {
    try {
      await pushService.unregister();
      console.log('[OneSignal] Unregistered from backend');
    } catch (error) {
      console.error('[OneSignal] Failed to unregister from backend:', error);
    }
  }

  // User tags for segmentation
  async setTags(tags: Record<string, string | number>): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // this.OneSignal.sendTags(tags);
      await AsyncStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
      console.log('[OneSignal] Tags set:', tags);
    } catch (error) {
      console.error('[OneSignal] Failed to set tags:', error);
    }
  }

  // Set subscription tier tag
  async setSubscriptionTier(tier: string): Promise<void> {
    await this.setTags({ subscription_tier: tier });
  }

  // Set gamification tags
  async setGamificationTags(data: {
    streak?: number;
    level?: number;
    xp?: number;
    dailyGoalProgress?: number;
  }): Promise<void> {
    const tags: Record<string, string | number> = {};

    if (data.streak !== undefined) {
      tags.streak = data.streak;
      // Set streak tier for segmentation
      if (data.streak >= 30) {
        tags.streak_tier = 'legendary';
      } else if (data.streak >= 14) {
        tags.streak_tier = 'dedicated';
      } else if (data.streak >= 7) {
        tags.streak_tier = 'consistent';
      } else {
        tags.streak_tier = 'starter';
      }
    }

    if (data.level !== undefined) {
      tags.level = data.level;
      // Set level tier for segmentation
      if (data.level >= 20) {
        tags.level_tier = 'master';
      } else if (data.level >= 10) {
        tags.level_tier = 'expert';
      } else if (data.level >= 5) {
        tags.level_tier = 'intermediate';
      } else {
        tags.level_tier = 'beginner';
      }
    }

    if (data.xp !== undefined) {
      tags.total_xp = data.xp;
    }

    if (data.dailyGoalProgress !== undefined) {
      tags.daily_goal_progress = data.dailyGoalProgress;
    }

    await this.setTags(tags);
  }

  // Set engagement status
  async setEngagementStatus(status: 'active' | 'at_risk' | 'churned'): Promise<void> {
    await this.setTags({ engagement_status: status });
  }

  // Subscribe to match notifications
  async subscribeToMatch(matchId: number): Promise<void> {
    await this.setTags({ [`match_${matchId}`]: 'subscribed' });
  }

  // Unsubscribe from match notifications
  async unsubscribeFromMatch(matchId: number): Promise<void> {
    if (!this.isInitialized) return;
    // this.OneSignal.deleteTag(`match_${matchId}`);
  }

  // Subscribe to league notifications
  async subscribeToLeague(leagueId: number): Promise<void> {
    await this.setTags({ [`league_${leagueId}`]: 'subscribed' });
  }

  // External ID (for user identification)
  async setExternalUserId(userId: string): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // this.OneSignal.setExternalUserId(userId);
      console.log('[OneSignal] External user ID set:', userId);
    } catch (error) {
      console.error('[OneSignal] Failed to set external user ID:', error);
    }
  }

  async removeExternalUserId(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // this.OneSignal.removeExternalUserId();
      console.log('[OneSignal] External user ID removed');
    } catch (error) {
      console.error('[OneSignal] Failed to remove external user ID:', error);
    }
  }
}

export const oneSignal = OneSignalService.getInstance();
