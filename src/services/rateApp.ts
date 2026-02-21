/**
 * Rate App Service
 *
 * Prompts users to rate the app at positive moments
 * Uses native in-app review dialog
 */

import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
const CONFIG = {
  MIN_WINS_BEFORE_PROMPT: 3,
  MIN_DAYS_BETWEEN_PROMPTS: 30,
  MAX_LIFETIME_PROMPTS: 3,
  APP_STORE_ID: '1234567890', // TODO: Replace with actual App Store ID
  PLAY_STORE_ID: 'fr.betly.app', // TODO: Replace with actual Play Store ID
};

// Storage keys
const STORAGE_KEYS = {
  WIN_COUNT: 'rate_app_win_count',
  LAST_PROMPT_DATE: 'rate_app_last_prompt_date',
  LIFETIME_PROMPTS: 'rate_app_lifetime_prompts',
  HAS_RATED: 'rate_app_has_rated',
};

class RateAppService {
  private static instance: RateAppService | null = null;

  private constructor() {}

  static getInstance(): RateAppService {
    if (!RateAppService.instance) {
      RateAppService.instance = new RateAppService();
    }
    return RateAppService.instance;
  }

  /**
   * Record a win and potentially request a review
   */
  async recordWinAndMaybeRequestReview(): Promise<boolean> {
    try {
      // Check if user has already rated
      const hasRated = await AsyncStorage.getItem(STORAGE_KEYS.HAS_RATED);
      if (hasRated === 'true') {
        console.log('[RateApp] User has already rated');
        return false;
      }

      // Increment win count
      const winCountStr = await AsyncStorage.getItem(STORAGE_KEYS.WIN_COUNT);
      const winCount = parseInt(winCountStr || '0', 10) + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.WIN_COUNT, String(winCount));

      // Check if we should prompt
      if (await this.shouldPrompt(winCount)) {
        return await this.requestReview();
      }

      return false;
    } catch (error) {
      console.error('[RateApp] Error recording win:', error);
      return false;
    }
  }

  private async shouldPrompt(winCount: number): Promise<boolean> {
    // Check minimum wins
    if (winCount < CONFIG.MIN_WINS_BEFORE_PROMPT) {
      return false;
    }

    // Check lifetime prompts
    const lifetimePromptsStr = await AsyncStorage.getItem(STORAGE_KEYS.LIFETIME_PROMPTS);
    const lifetimePrompts = parseInt(lifetimePromptsStr || '0', 10);
    if (lifetimePrompts >= CONFIG.MAX_LIFETIME_PROMPTS) {
      return false;
    }

    // Check days since last prompt
    const lastPromptDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROMPT_DATE);
    if (lastPromptDate) {
      const daysSinceLastPrompt = Math.floor(
        (Date.now() - new Date(lastPromptDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastPrompt < CONFIG.MIN_DAYS_BETWEEN_PROMPTS) {
        return false;
      }
    }

    return true;
  }

  /**
   * Request an in-app review
   */
  async requestReview(): Promise<boolean> {
    try {
      // Check if in-app review is available
      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        await StoreReview.requestReview();
        await this.recordPrompt();
        console.log('[RateApp] Review requested');
        return true;
      } else {
        console.log('[RateApp] In-app review not available');
        return false;
      }
    } catch (error) {
      console.error('[RateApp] Error requesting review:', error);
      return false;
    }
  }

  private async recordPrompt(): Promise<void> {
    const lifetimePromptsStr = await AsyncStorage.getItem(STORAGE_KEYS.LIFETIME_PROMPTS);
    const lifetimePrompts = parseInt(lifetimePromptsStr || '0', 10);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.LAST_PROMPT_DATE, new Date().toISOString()),
      AsyncStorage.setItem(STORAGE_KEYS.LIFETIME_PROMPTS, String(lifetimePrompts + 1)),
    ]);
  }

  /**
   * Mark that user has rated the app
   */
  async markAsRated(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_RATED, 'true');
    console.log('[RateApp] Marked as rated');
  }

  /**
   * Open the app store listing directly
   * Use this as a fallback or when user explicitly wants to rate
   */
  async openStoreListing(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        // App Store
        const url = `itms-apps://itunes.apple.com/app/id${CONFIG.APP_STORE_ID}?action=write-review`;
        await Linking.openURL(url);
      } else {
        // Play Store
        const url = `market://details?id=${CONFIG.PLAY_STORE_ID}`;
        await Linking.openURL(url);
      }
    } catch (error) {
      // Fallback to web URLs
      if (Platform.OS === 'ios') {
        await Linking.openURL(
          `https://apps.apple.com/app/id${CONFIG.APP_STORE_ID}?action=write-review`
        );
      } else {
        await Linking.openURL(
          `https://play.google.com/store/apps/details?id=${CONFIG.PLAY_STORE_ID}`
        );
      }
    }
  }

  /**
   * Reset all rate app data (for testing)
   */
  async reset(): Promise<void> {
    await Promise.all(
      Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key))
    );
    console.log('[RateApp] Data reset');
  }
}

export const rateApp = RateAppService.getInstance();
