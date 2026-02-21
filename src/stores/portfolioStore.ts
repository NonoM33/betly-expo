import { create } from 'zustand';
import { portfolioService, ticketsService } from '../api/services';
import type { Portfolio, Ticket } from '../types';

interface PortfolioStats {
  winRate: number;
  avgOdds: number;
  bestStreak: number;
  currentStreak: number;
  monthlyProfit: number;
  weeklyProfit: number;
}

interface PortfolioState {
  // Data
  portfolio: Portfolio | null;
  stats: PortfolioStats | null;
  recentTickets: Ticket[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPortfolio: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadRecentTickets: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: () => void;

  // Helpers
  getROI: () => number;
  getWinRate: () => number;
  getTotalProfit: () => number;
  getPendingCount: () => number;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: null,
  stats: null,
  recentTickets: [],
  isLoading: false,
  error: null,

  loadPortfolio: async () => {
    try {
      set({ isLoading: true, error: null });
      const portfolio = await portfolioService.getPortfolio();
      set({ portfolio });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load portfolio' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadStats: async () => {
    try {
      const stats = await portfolioService.getStats();
      set({ stats });
    } catch (error: any) {
      console.error('Failed to load portfolio stats:', error);
    }
  },

  loadRecentTickets: async () => {
    try {
      const tickets = await ticketsService.getTickets();
      // Get last 10 tickets
      set({ recentTickets: tickets.slice(0, 10) });
    } catch (error: any) {
      console.error('Failed to load recent tickets:', error);
    }
  },

  refreshAll: async () => {
    try {
      set({ isLoading: true, error: null });
      await Promise.all([
        get().loadPortfolio(),
        get().loadStats(),
        get().loadRecentTickets(),
      ]);
    } catch (error: any) {
      set({ error: error.message || 'Failed to refresh portfolio' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  getROI: () => {
    const portfolio = get().portfolio;
    return portfolio?.roi || 0;
  },

  getWinRate: () => {
    const portfolio = get().portfolio;
    return portfolio?.winRate || 0;
  },

  getTotalProfit: () => {
    const portfolio = get().portfolio;
    return portfolio?.profit || 0;
  },

  getPendingCount: () => {
    const portfolio = get().portfolio;
    return portfolio?.pendingBets || 0;
  },
}));
