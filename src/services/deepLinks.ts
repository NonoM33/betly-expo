/**
 * Deep Links Service
 *
 * Handles universal links and app links for navigation
 */

import { Linking, Platform } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'pending_referral_code';

// URL patterns
const PATTERNS = {
  MATCH: /\/match(?:es)?\/(\d+)/,
  TIP: /\/tips?\/([a-zA-Z0-9-]+)/,
  REFERRAL: /\/invite\/([a-zA-Z0-9]+)/,
  PRICING: /\/pricing(?:\?promo=([a-zA-Z0-9]+))?/,
  CREDITS: /\/credits/,
  PROFILE: /\/profile/,
  SETTINGS: /\/settings/,
};

export interface DeepLinkResult {
  type: 'match' | 'tip' | 'referral' | 'pricing' | 'credits' | 'profile' | 'settings' | 'unknown';
  params?: Record<string, string>;
  path: string;
}

class DeepLinksService {
  private static instance: DeepLinksService | null = null;
  private isInitialized = false;
  private pendingLink: string | null = null;

  private constructor() {}

  static getInstance(): DeepLinksService {
    if (!DeepLinksService.instance) {
      DeepLinksService.instance = new DeepLinksService();
    }
    return DeepLinksService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Handle initial URL
    const initialUrl = await ExpoLinking.getInitialURL();
    if (initialUrl) {
      console.log('[DeepLinks] Initial URL:', initialUrl);
      this.pendingLink = initialUrl;
    }

    // Listen for incoming URLs
    Linking.addEventListener('url', this.handleUrlEvent);

    this.isInitialized = true;
    console.log('[DeepLinks] Initialized');
  }

  private handleUrlEvent = (event: { url: string }) => {
    console.log('[DeepLinks] URL received:', event.url);
    this.handleUrl(event.url);
  };

  parseUrl(url: string): DeepLinkResult {
    const path = url.replace(/^https?:\/\/[^/]+/, '').replace(/^betly:\/\//, '');

    // Match
    const matchResult = path.match(PATTERNS.MATCH);
    if (matchResult) {
      return {
        type: 'match',
        params: { id: matchResult[1] },
        path: `/match/${matchResult[1]}`,
      };
    }

    // Tip
    const tipResult = path.match(PATTERNS.TIP);
    if (tipResult) {
      return {
        type: 'tip',
        params: { id: tipResult[1] },
        path: `/tip/${tipResult[1]}`,
      };
    }

    // Referral
    const referralResult = path.match(PATTERNS.REFERRAL);
    if (referralResult) {
      return {
        type: 'referral',
        params: { code: referralResult[1] },
        path: '/',
      };
    }

    // Pricing
    const pricingResult = path.match(PATTERNS.PRICING);
    if (pricingResult) {
      return {
        type: 'pricing',
        params: pricingResult[1] ? { promo: pricingResult[1] } : undefined,
        path: '/pricing',
      };
    }

    // Credits
    if (PATTERNS.CREDITS.test(path)) {
      return {
        type: 'credits',
        path: '/credits',
      };
    }

    // Profile
    if (PATTERNS.PROFILE.test(path)) {
      return {
        type: 'profile',
        path: '/profile',
      };
    }

    // Settings
    if (PATTERNS.SETTINGS.test(path)) {
      return {
        type: 'settings',
        path: '/settings',
      };
    }

    return {
      type: 'unknown',
      path: '/',
    };
  }

  async handleUrl(url: string): Promise<void> {
    const result = this.parseUrl(url);
    console.log('[DeepLinks] Parsed URL:', result);

    // Handle referral codes specially - store for later use
    if (result.type === 'referral' && result.params?.code) {
      await this.saveReferralCode(result.params.code);
      // Navigate to home or onboarding
      router.replace('/');
      return;
    }

    // Navigate to the appropriate path
    if (result.path !== '/') {
      router.push(result.path as any);
    }
  }

  async processPendingLink(): Promise<void> {
    if (this.pendingLink) {
      const link = this.pendingLink;
      this.pendingLink = null;
      await this.handleUrl(link);
    }
  }

  hasPendingLink(): boolean {
    return this.pendingLink !== null;
  }

  // Referral code management
  async saveReferralCode(code: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, code);
    console.log('[DeepLinks] Referral code saved:', code);
  }

  async getReferralCode(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEY);
  }

  async clearReferralCode(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  // Extract referral code from various URL formats
  extractReferralCode(url: string): string | null {
    // ?ref=CODE
    const refMatch = url.match(/[?&]ref=([a-zA-Z0-9]+)/);
    if (refMatch) return refMatch[1];

    // ?referral_code=CODE
    const referralMatch = url.match(/[?&]referral_code=([a-zA-Z0-9]+)/);
    if (referralMatch) return referralMatch[1];

    // start=ref_CODE (Telegram format)
    const telegramMatch = url.match(/start=ref_([a-zA-Z0-9]+)/);
    if (telegramMatch) return telegramMatch[1];

    // /invite/CODE
    const inviteMatch = url.match(PATTERNS.REFERRAL);
    if (inviteMatch) return inviteMatch[1];

    return null;
  }

  // Generate a share URL
  generateShareUrl(path: string): string {
    const baseUrl = 'https://betly.fr';
    return `${baseUrl}${path}`;
  }

  generateReferralUrl(code: string): string {
    return this.generateShareUrl(`/invite/${code}`);
  }

  generateMatchUrl(matchId: number): string {
    return this.generateShareUrl(`/match/${matchId}`);
  }

  generateTipUrl(tipId: string): string {
    return this.generateShareUrl(`/tip/${tipId}`);
  }

  destroy(): void {
    // Note: In newer React Native, we need to use the subscription returned by addEventListener
    // For simplicity, this is a no-op in this implementation
    this.isInitialized = false;
  }
}

export const deepLinks = DeepLinksService.getInstance();
