import { create } from 'zustand';
import { matchesService, predictionsService } from '../api/services';
import type { MatchWithOdds, MatchDetails, Prediction } from '../types';
import { format } from 'date-fns';

interface MatchesState {
  // State
  matches: MatchWithOdds[];
  liveMatches: MatchWithOdds[];
  selectedDate: Date;
  selectedMatch: MatchDetails | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMatch: boolean;
  error: string | null;

  // Live refresh
  liveRefreshInterval: NodeJS.Timeout | null;

  // Actions
  loadMatches: (date?: Date) => Promise<void>;
  refreshMatches: () => Promise<void>;
  loadLiveMatches: () => Promise<void>;
  loadMatchDetails: (matchId: number) => Promise<void>;
  unlockPrediction: (matchId: number) => Promise<Prediction>;
  setSelectedDate: (date: Date) => void;
  clearSelectedMatch: () => void;
  startLiveRefresh: () => void;
  stopLiveRefresh: () => void;
  clearError: () => void;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  liveMatches: [],
  selectedDate: new Date(),
  selectedMatch: null,
  isLoading: false,
  isRefreshing: false,
  isLoadingMatch: false,
  error: null,
  liveRefreshInterval: null,

  loadMatches: async (date?: Date) => {
    try {
      set({ isLoading: true, error: null });

      const targetDate = date || get().selectedDate;
      const dateStr = format(targetDate, 'yyyy-MM-dd');

      const matches = await matchesService.getMatches(dateStr);

      set({ matches, selectedDate: targetDate });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load matches' });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshMatches: async () => {
    try {
      set({ isRefreshing: true, error: null });

      const dateStr = format(get().selectedDate, 'yyyy-MM-dd');
      const matches = await matchesService.getMatches(dateStr);

      set({ matches });
    } catch (error: any) {
      set({ error: error.message || 'Failed to refresh matches' });
    } finally {
      set({ isRefreshing: false });
    }
  },

  loadLiveMatches: async () => {
    try {
      const liveMatches = await matchesService.getLiveMatches();
      set({ liveMatches });
    } catch (error: any) {
      console.error('Failed to load live matches:', error);
    }
  },

  loadMatchDetails: async (matchId: number) => {
    try {
      set({ isLoadingMatch: true, error: null, selectedMatch: null });

      const match = await matchesService.getMatchById(matchId);
      set({ selectedMatch: match });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load match details' });
    } finally {
      set({ isLoadingMatch: false });
    }
  },

  unlockPrediction: async (matchId: number) => {
    try {
      const prediction = await predictionsService.unlockPrediction(matchId);

      // Update the selected match with the unlocked prediction
      const selectedMatch = get().selectedMatch;
      if (selectedMatch && selectedMatch.id === matchId) {
        set({
          selectedMatch: {
            ...selectedMatch,
            prediction,
            isUnlocked: true,
          },
        });
      }

      // Update the matches list
      const matches = get().matches.map((match) => {
        if (match.id === matchId && match.prediction) {
          return {
            ...match,
            prediction: { ...match.prediction, isUnlocked: true },
          };
        }
        return match;
      });
      set({ matches });

      return prediction;
    } catch (error: any) {
      throw error;
    }
  },

  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
    get().loadMatches(date);
  },

  clearSelectedMatch: () => {
    set({ selectedMatch: null });
  },

  startLiveRefresh: () => {
    // Stop any existing interval
    get().stopLiveRefresh();

    // Start new interval (refresh every 30 seconds)
    const interval = setInterval(() => {
      const isViewingToday = format(get().selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
      if (isViewingToday && get().liveMatches.length > 0) {
        get().loadLiveMatches();
        get().refreshMatches();
      }
    }, 30000);

    set({ liveRefreshInterval: interval });
  },

  stopLiveRefresh: () => {
    const interval = get().liveRefreshInterval;
    if (interval) {
      clearInterval(interval);
      set({ liveRefreshInterval: null });
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper to check if match is live
export const isMatchLive = (status: string): boolean => {
  const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'];
  return liveStatuses.includes(status.toUpperCase());
};

// Helper to check if match is finished
export const isMatchFinished = (status: string): boolean => {
  const finishedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO'];
  return finishedStatuses.includes(status.toUpperCase());
};

// Helper to get status display text
export const getStatusDisplay = (status: string, elapsed?: number): string => {
  switch (status.toUpperCase()) {
    case 'NS':
      return 'Not Started';
    case '1H':
      return elapsed ? `${elapsed}'` : '1st Half';
    case 'HT':
      return 'Half Time';
    case '2H':
      return elapsed ? `${elapsed}'` : '2nd Half';
    case 'ET':
      return elapsed ? `${elapsed}'` : 'Extra Time';
    case 'BT':
      return 'Break';
    case 'P':
      return 'Penalties';
    case 'FT':
      return 'Full Time';
    case 'AET':
      return 'After ET';
    case 'PEN':
      return 'After Pens';
    case 'PST':
      return 'Postponed';
    case 'CANC':
      return 'Cancelled';
    case 'ABD':
      return 'Abandoned';
    case 'SUSP':
      return 'Suspended';
    case 'INT':
      return 'Interrupted';
    case 'AWD':
      return 'Awarded';
    case 'WO':
      return 'Walkover';
    case 'TBD':
      return 'TBD';
    case 'LIVE':
      return elapsed ? `${elapsed}'` : 'LIVE';
    default:
      return status;
  }
};
