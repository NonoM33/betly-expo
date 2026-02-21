import { create } from 'zustand';
import { referralsService } from '../api/services';
import type { ReferralStats, LeaderboardEntry } from '../types';

interface WeekendStatus {
  isWeekend: boolean;
  multiplier: number;
  endsAt?: string;
}

interface ReferralState {
  // Data
  stats: ReferralStats | null;
  weekendStatus: WeekendStatus | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadStats: () => Promise<void>;
  loadWeekendStatus: () => Promise<void>;
  loadLeaderboard: (limit?: number) => Promise<void>;
  share: () => Promise<string | null>;
  claimReward: (rewardId: string) => Promise<boolean>;
  clearError: () => void;

  // Helpers
  getReferralCode: () => string | null;
  getReferralLink: () => string;
  hasRewards: () => boolean;
}

export const useReferralStore = create<ReferralState>((set, get) => ({
  stats: null,
  weekendStatus: null,
  leaderboard: [],
  isLoading: false,
  error: null,

  loadStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const stats = await referralsService.getStats();
      set({ stats });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load referral stats' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadWeekendStatus: async () => {
    try {
      const weekendStatus = await referralsService.getWeekendStatus();
      set({ weekendStatus });
    } catch (error) {
      console.error('Failed to load weekend status:', error);
    }
  },

  loadLeaderboard: async (limit = 10) => {
    try {
      const leaderboard = await referralsService.getLeaderboard(limit);
      set({ leaderboard });
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  },

  share: async () => {
    try {
      const shareUrl = await referralsService.share();
      return shareUrl;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get share URL' });
      return null;
    }
  },

  claimReward: async (rewardId: string) => {
    try {
      set({ isLoading: true, error: null });
      await referralsService.claimReward(rewardId);
      // Reload stats after claiming
      await get().loadStats();
      return true;
    } catch (error: any) {
      set({ error: error.message || 'Failed to claim reward' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  getReferralCode: () => {
    return get().stats?.referralCode || null;
  },

  getReferralLink: () => {
    const code = get().stats?.referralCode;
    if (!code) return 'https://betly.fr';
    return `https://betly.fr/invite/${code}`;
  },

  hasRewards: () => {
    const stats = get().stats;
    return (stats?.pendingRewards || 0) > 0;
  },
}));
