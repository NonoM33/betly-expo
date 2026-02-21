/**
 * Analytics Service
 *
 * Wrapper for analytics tracking (Firebase Analytics compatible)
 * In a production app, you would integrate with Firebase, Mixpanel, Amplitude, etc.
 */

import { Platform } from 'react-native';

// Event names
export const AnalyticsEvents = {
  // Authentication
  LOGIN: 'login',
  SIGNUP: 'signup',
  LOGOUT: 'logout',

  // Monetization
  SUBSCRIPTION_PURCHASED: 'subscription_purchased',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  CREDITS_PURCHASED: 'credits_purchased',
  TIP_UNLOCKED: 'tip_unlocked',

  // Engagement
  TIP_VIEWED: 'tip_viewed',
  MATCH_VIEWED: 'match_viewed',
  SEARCH_PERFORMED: 'search_performed',
  BET_ADDED_TO_TICKET: 'bet_added_to_ticket',

  // Gamification
  STREAK_ACHIEVED: 'streak_achieved',
  STREAK_LOST: 'streak_lost',
  LEVEL_UP: 'level_up',
  XP_EARNED: 'xp_earned',
  BADGE_UNLOCKED: 'badge_unlocked',

  // Errors
  API_ERROR: 'api_error',
  PURCHASE_ERROR: 'purchase_error',
} as const;

class AnalyticsService {
  private static instance: AnalyticsService | null = null;
  private isInitialized = false;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async initialize(): Promise<void> {
    // In production, initialize Firebase Analytics here
    // await firebase.analytics().setAnalyticsCollectionEnabled(true);
    this.isInitialized = true;
    console.log('[Analytics] Initialized');
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
    // firebase.analytics().setUserId(userId);
    console.log('[Analytics] User ID set:', userId);
  }

  async setUserProperties(properties: Record<string, string | number | null>): Promise<void> {
    // firebase.analytics().setUserProperties(properties);
    console.log('[Analytics] User properties set:', properties);
  }

  async trackEvent(eventName: string, params?: Record<string, any>): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[Analytics] Not initialized, skipping event:', eventName);
      return;
    }

    const enrichedParams = {
      ...params,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    };

    // firebase.analytics().logEvent(eventName, enrichedParams);
    console.log('[Analytics] Event:', eventName, enrichedParams);
  }

  async trackScreen(screenName: string): Promise<void> {
    // firebase.analytics().logScreenView({ screen_name: screenName });
    console.log('[Analytics] Screen:', screenName);
  }

  // Authentication events
  async trackLogin(method: 'google' | 'apple' | 'email'): Promise<void> {
    await this.trackEvent(AnalyticsEvents.LOGIN, { method });
  }

  async trackSignup(method: 'google' | 'apple' | 'email'): Promise<void> {
    await this.trackEvent(AnalyticsEvents.SIGNUP, { method });
  }

  async trackLogout(): Promise<void> {
    await this.trackEvent(AnalyticsEvents.LOGOUT);
  }

  // Monetization events
  async trackSubscriptionPurchased(tier: string, price: number): Promise<void> {
    await this.trackEvent(AnalyticsEvents.SUBSCRIPTION_PURCHASED, { tier, price });
  }

  async trackCreditsPurchased(amount: number, price: number): Promise<void> {
    await this.trackEvent(AnalyticsEvents.CREDITS_PURCHASED, { amount, price });
  }

  async trackTipUnlocked(tipId: string, credits: number): Promise<void> {
    await this.trackEvent(AnalyticsEvents.TIP_UNLOCKED, { tipId, credits });
  }

  // Engagement events
  async trackTipViewed(tipId: string, category: string): Promise<void> {
    await this.trackEvent(AnalyticsEvents.TIP_VIEWED, { tipId, category });
  }

  async trackMatchViewed(matchId: number): Promise<void> {
    await this.trackEvent(AnalyticsEvents.MATCH_VIEWED, { matchId });
  }

  async trackSearchPerformed(query: string, resultsCount: number): Promise<void> {
    await this.trackEvent(AnalyticsEvents.SEARCH_PERFORMED, { query, resultsCount });
  }

  // Gamification events
  async trackStreakAchieved(streakDays: number, isMilestone: boolean): Promise<void> {
    await this.trackEvent(AnalyticsEvents.STREAK_ACHIEVED, { streakDays, isMilestone });
  }

  async trackStreakLost(previousStreak: number): Promise<void> {
    await this.trackEvent(AnalyticsEvents.STREAK_LOST, { previousStreak });
  }

  async trackLevelUp(newLevel: number, totalXP: number): Promise<void> {
    await this.trackEvent(AnalyticsEvents.LEVEL_UP, { newLevel, totalXP });
  }

  async trackXPEarned(xpAmount: number, reason: string): Promise<void> {
    await this.trackEvent(AnalyticsEvents.XP_EARNED, { xpAmount, reason });
  }

  async trackBadgeUnlocked(badgeId: string, badgeName: string): Promise<void> {
    await this.trackEvent(AnalyticsEvents.BADGE_UNLOCKED, { badgeId, badgeName });
  }

  // User property setters
  async setSubscriptionTier(tier: string): Promise<void> {
    await this.setUserProperties({ subscription_tier: tier });
  }

  async setStreakCount(streak: number): Promise<void> {
    await this.setUserProperties({ streak_count: streak });
  }

  async setLevel(level: number): Promise<void> {
    await this.setUserProperties({ level });
  }

  async setCreditsBalance(credits: number): Promise<void> {
    await this.setUserProperties({ credits_balance: credits });
  }

  // Error tracking
  async trackError(errorType: string, message: string, context?: Record<string, any>): Promise<void> {
    await this.trackEvent(AnalyticsEvents.API_ERROR, {
      errorType,
      message,
      ...context,
    });
  }
}

export const analytics = AnalyticsService.getInstance();
