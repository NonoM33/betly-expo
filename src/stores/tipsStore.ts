import { create } from 'zustand';
import { tipsService } from '../api/services';
import type { BettingTip, TipsResponse, MatchDuJour, ParlayTip, TipsStats } from '../types';

interface TipsState {
  // State
  tipOfTheDay: BettingTip | null;
  matchDuJour: MatchDuJour | null;
  strongPicks: BettingTip[];
  moderatePicks: BettingTip[];
  parlays: ParlayTip[];
  stats: TipsStats | null;
  selectedTip: BettingTip | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  loadTips: () => Promise<void>;
  refreshTips: () => Promise<void>;
  loadTipById: (id: string) => Promise<void>;
  unlockTip: (id: string) => Promise<BettingTip>;
  clearSelectedTip: () => void;
  clearError: () => void;
}

export const useTipsStore = create<TipsState>((set, get) => ({
  tipOfTheDay: null,
  matchDuJour: null,
  strongPicks: [],
  moderatePicks: [],
  parlays: [],
  stats: null,
  selectedTip: null,
  isLoading: false,
  isRefreshing: false,
  error: null,

  loadTips: async () => {
    try {
      set({ isLoading: true, error: null });

      const response: TipsResponse = await tipsService.getTips();

      set({
        tipOfTheDay: response.tipOfTheDay || null,
        matchDuJour: response.matchDuJour || null,
        strongPicks: response.strongPicks || [],
        moderatePicks: response.moderatePicks || [],
        parlays: response.parlays || [],
        stats: response.stats || null,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load tips' });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshTips: async () => {
    try {
      set({ isRefreshing: true, error: null });

      const response: TipsResponse = await tipsService.getTips();

      set({
        tipOfTheDay: response.tipOfTheDay || null,
        matchDuJour: response.matchDuJour || null,
        strongPicks: response.strongPicks || [],
        moderatePicks: response.moderatePicks || [],
        parlays: response.parlays || [],
        stats: response.stats || null,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to refresh tips' });
    } finally {
      set({ isRefreshing: false });
    }
  },

  loadTipById: async (id: string) => {
    try {
      const tip = await tipsService.getTipById(id);
      set({ selectedTip: tip });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load tip' });
    }
  },

  unlockTip: async (id: string) => {
    try {
      const tip = await tipsService.unlockTip(id);

      // Update the tip in the appropriate list
      const updateTipList = (tips: BettingTip[]) =>
        tips.map((t) => (t.id === id ? { ...t, ...tip, isUnlocked: true } : t));

      set({
        strongPicks: updateTipList(get().strongPicks),
        moderatePicks: updateTipList(get().moderatePicks),
        tipOfTheDay:
          get().tipOfTheDay?.id === id
            ? { ...get().tipOfTheDay!, ...tip, isUnlocked: true }
            : get().tipOfTheDay,
        selectedTip:
          get().selectedTip?.id === id
            ? { ...get().selectedTip!, ...tip, isUnlocked: true }
            : get().selectedTip,
      });

      return tip;
    } catch (error: any) {
      throw error;
    }
  },

  clearSelectedTip: () => {
    set({ selectedTip: null });
  },

  clearError: () => set({ error: null }),
}));

// Helper to get tip category display name
export const getTipCategoryDisplay = (category: string): string => {
  switch (category) {
    case 'winner':
      return 'Match Winner';
    case 'over_under':
      return 'Over/Under';
    case 'btts':
      return 'Both Teams To Score';
    case 'double_chance':
      return 'Double Chance';
    case 'correct_score':
      return 'Correct Score';
    case 'handicap':
      return 'Asian Handicap';
    default:
      return category;
  }
};

// Helper to get confidence level
export const getConfidenceLevel = (confidence: number): 'strong' | 'moderate' | 'speculative' => {
  if (confidence >= 75) return 'strong';
  if (confidence >= 60) return 'moderate';
  return 'speculative';
};
