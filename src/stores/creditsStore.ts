import { create } from 'zustand';
import { creditsService } from '../api/services';
import type { CreditBalance, CreditPack, CreditTransaction, CreditCosts, ContentUnlockStatus } from '../types';

interface CreditsState {
  // State
  balance: CreditBalance | null;
  packs: CreditPack[];
  transactions: CreditTransaction[];
  costs: CreditCosts | null;
  isLoading: boolean;
  isSpending: boolean;
  error: string | null;

  // Actions
  loadBalance: () => Promise<void>;
  loadPacks: () => Promise<void>;
  loadHistory: () => Promise<void>;
  loadCosts: () => Promise<void>;
  checkUnlock: (contentType: string, contentId: string) => Promise<ContentUnlockStatus>;
  spend: (contentType: string, contentId: string) => Promise<CreditBalance>;
  refreshAll: () => Promise<void>;
  clearError: () => void;

  // Helpers
  canAfford: (cost: number) => boolean;
  getTotalCredits: () => number;
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
  balance: null,
  packs: [],
  transactions: [],
  costs: null,
  isLoading: false,
  isSpending: false,
  error: null,

  loadBalance: async () => {
    try {
      set({ isLoading: true, error: null });
      const balance = await creditsService.getBalance();
      set({ balance });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load balance' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadPacks: async () => {
    try {
      const packs = await creditsService.getPacks();
      set({ packs });
    } catch (error: any) {
      console.error('Failed to load credit packs:', error);
    }
  },

  loadHistory: async () => {
    try {
      const transactions = await creditsService.getHistory();
      set({ transactions });
    } catch (error: any) {
      console.error('Failed to load transaction history:', error);
    }
  },

  loadCosts: async () => {
    try {
      const costs = await creditsService.getCosts();
      set({ costs });
    } catch (error: any) {
      console.error('Failed to load costs:', error);
    }
  },

  checkUnlock: async (contentType: string, contentId: string) => {
    return await creditsService.checkUnlock(contentType, contentId);
  },

  spend: async (contentType: string, contentId: string) => {
    try {
      set({ isSpending: true, error: null });
      const balance = await creditsService.spend(contentType, contentId);
      set({ balance });
      return balance;
    } catch (error: any) {
      set({ error: error.message || 'Failed to spend credits' });
      throw error;
    } finally {
      set({ isSpending: false });
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().loadBalance(),
      get().loadPacks(),
      get().loadCosts(),
    ]);
  },

  clearError: () => set({ error: null }),

  // Helpers
  canAfford: (cost: number) => {
    const balance = get().balance;
    if (!balance) return false;
    return balance.total >= cost;
  },

  getTotalCredits: () => {
    const balance = get().balance;
    return balance?.total || 0;
  },
}));

// Content type costs (defaults, should be loaded from API)
export const DEFAULT_COSTS = {
  match_prediction: 5,
  tip: 3,
  parlay: 10,
  ai_chat: 1, // per message
  value_bet: 5,
  team_analysis: 8,
  player_analysis: 5,
};

// Get cost for content type
export const getCostForContent = (costs: CreditCosts | null, contentType: string): number => {
  if (!costs) return DEFAULT_COSTS[contentType as keyof typeof DEFAULT_COSTS] || 5;

  switch (contentType) {
    case 'match_prediction':
      return costs.matchPrediction;
    case 'tip':
      return costs.tip;
    case 'parlay':
      return costs.parlay;
    case 'ai_chat':
      return costs.aiChat;
    case 'value_bet':
      return costs.valueBet;
    case 'team_analysis':
      return costs.teamAnalysis;
    case 'player_analysis':
      return costs.playerAnalysis;
    default:
      return 5;
  }
};
