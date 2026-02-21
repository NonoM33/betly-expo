/**
 * RevenueCat Service
 *
 * In-app purchases and subscriptions management
 * Uses react-native-purchases for RevenueCat integration
 */

import { Platform } from 'react-native';
import { analytics } from './analytics';

// Configuration
const CONFIG = {
  IOS_API_KEY: 'appl_swccyTOHakJrcUurwQtpqXuPZIo',
  ANDROID_API_KEY: 'goog_YOUR_API_KEY', // TODO: Add Android key
};

// Product IDs
export const PRODUCTS = {
  SUBSCRIPTIONS: {
    PREMIUM: 'premium_monthly',
    VIP: 'vip_monthly',
    EXPERT: 'expert_monthly',
  },
  CREDITS: {
    PACK_50: 'credits_50',
    PACK_200: 'credits_200',
    PACK_600: 'credits_600',
    PACK_2000: 'credits_2000',
  },
} as const;

// Entitlements
export const ENTITLEMENTS = {
  PREMIUM: 'premium',
  VIP: 'vip',
  EXPERT: 'expert',
} as const;

export interface Product {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

export interface Offering {
  identifier: string;
  products: Product[];
}

export interface CustomerInfo {
  entitlements: {
    active: Record<string, { identifier: string; expirationDate?: string }>;
  };
  activeSubscriptions: string[];
  originalAppUserId: string;
}

class RevenueCatService {
  private static instance: RevenueCatService | null = null;
  private isInitialized = false;
  private Purchases: any = null;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Dynamically import Purchases to handle cases where it's not installed
      // In production, you would use: import Purchases from 'react-native-purchases';
      // this.Purchases = require('react-native-purchases').default;

      const apiKey = Platform.OS === 'ios' ? CONFIG.IOS_API_KEY : CONFIG.ANDROID_API_KEY;

      // await this.Purchases.configure({ apiKey });
      this.isInitialized = true;
      console.log('[RevenueCat] Initialized with key:', apiKey.substring(0, 10) + '...');
    } catch (error) {
      console.warn('[RevenueCat] Failed to initialize:', error);
    }
  }

  async login(userId: string): Promise<void> {
    if (!this.isInitialized) return;
    try {
      // await this.Purchases.logIn(userId);
      console.log('[RevenueCat] Logged in user:', userId);
    } catch (error) {
      console.error('[RevenueCat] Login failed:', error);
    }
  }

  async logout(): Promise<void> {
    if (!this.isInitialized) return;
    try {
      // await this.Purchases.logOut();
      console.log('[RevenueCat] Logged out');
    } catch (error) {
      console.error('[RevenueCat] Logout failed:', error);
    }
  }

  async getOfferings(): Promise<Offering[]> {
    if (!this.isInitialized) return [];
    try {
      // const offerings = await this.Purchases.getOfferings();
      // return offerings.all;
      console.log('[RevenueCat] Getting offerings...');
      return [];
    } catch (error) {
      console.error('[RevenueCat] Failed to get offerings:', error);
      return [];
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.isInitialized) return null;
    try {
      // const info = await this.Purchases.getCustomerInfo();
      // return info;
      console.log('[RevenueCat] Getting customer info...');
      return null;
    } catch (error) {
      console.error('[RevenueCat] Failed to get customer info:', error);
      return null;
    }
  }

  async purchaseSubscription(productId: string): Promise<{ success: boolean; tier?: string }> {
    if (!this.isInitialized) {
      return { success: false };
    }

    try {
      // const { customerInfo } = await this.Purchases.purchaseProduct(productId);
      console.log('[RevenueCat] Purchasing subscription:', productId);

      // Determine tier from product ID
      let tier: string | undefined;
      if (productId.includes('expert')) {
        tier = 'expert';
      } else if (productId.includes('vip')) {
        tier = 'vip';
      } else if (productId.includes('premium')) {
        tier = 'premium';
      }

      if (tier) {
        await analytics.trackSubscriptionPurchased(tier, 0);
      }

      return { success: true, tier };
    } catch (error: any) {
      console.error('[RevenueCat] Purchase failed:', error);

      // Check if user cancelled
      if (error.userCancelled) {
        return { success: false };
      }

      throw error;
    }
  }

  async purchaseCredits(productId: string): Promise<{ success: boolean; credits?: number }> {
    if (!this.isInitialized) {
      return { success: false };
    }

    try {
      // const { customerInfo } = await this.Purchases.purchaseProduct(productId);
      console.log('[RevenueCat] Purchasing credits:', productId);

      // Determine credits from product ID
      let credits: number | undefined;
      if (productId.includes('2000')) {
        credits = 2000;
      } else if (productId.includes('600')) {
        credits = 600;
      } else if (productId.includes('200')) {
        credits = 200;
      } else if (productId.includes('50')) {
        credits = 50;
      }

      if (credits) {
        await analytics.trackCreditsPurchased(credits, 0);
      }

      return { success: true, credits };
    } catch (error: any) {
      console.error('[RevenueCat] Purchase failed:', error);

      if (error.userCancelled) {
        return { success: false };
      }

      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo | null> {
    if (!this.isInitialized) return null;

    try {
      // const customerInfo = await this.Purchases.restorePurchases();
      console.log('[RevenueCat] Restoring purchases...');
      return null;
    } catch (error) {
      console.error('[RevenueCat] Failed to restore purchases:', error);
      throw error;
    }
  }

  hasEntitlement(customerInfo: CustomerInfo | null, entitlement: string): boolean {
    if (!customerInfo) return false;
    return entitlement in customerInfo.entitlements.active;
  }

  getActiveSubscription(customerInfo: CustomerInfo | null): string | null {
    if (!customerInfo || customerInfo.activeSubscriptions.length === 0) {
      return null;
    }
    return customerInfo.activeSubscriptions[0];
  }

  getSubscriptionTier(customerInfo: CustomerInfo | null): 'free' | 'premium' | 'vip' | 'expert' {
    if (!customerInfo) return 'free';

    if (this.hasEntitlement(customerInfo, ENTITLEMENTS.EXPERT)) {
      return 'expert';
    }
    if (this.hasEntitlement(customerInfo, ENTITLEMENTS.VIP)) {
      return 'vip';
    }
    if (this.hasEntitlement(customerInfo, ENTITLEMENTS.PREMIUM)) {
      return 'premium';
    }

    return 'free';
  }
}

export const revenueCat = RevenueCatService.getInstance();
