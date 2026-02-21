import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ticketsService } from '../api/services';
import type { Ticket, TicketSelection, Match } from '../types';

const STORAGE_KEY = 'current_ticket';

interface TicketState {
  // Current ticket being built
  currentTicket: {
    selections: TicketSelection[];
    stake: number;
  };

  // Saved tickets
  tickets: Ticket[];

  // State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions - Building ticket
  addSelection: (selection: TicketSelection) => void;
  removeSelection: (matchId: number) => void;
  updateStake: (stake: number) => void;
  clearTicket: () => void;

  // Actions - API
  loadTickets: () => Promise<void>;
  saveTicket: () => Promise<Ticket | null>;
  deleteTicket: (id: string) => Promise<boolean>;

  // Actions - Persistence
  loadCurrentTicket: () => Promise<void>;
  persistCurrentTicket: () => Promise<void>;

  // Helpers
  hasSelection: (matchId: number) => boolean;
  getSelection: (matchId: number) => TicketSelection | undefined;
  getTotalOdds: () => number;
  getPotentialWin: () => number;
  getSelectionCount: () => number;

  // Clear error
  clearError: () => void;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  currentTicket: {
    selections: [],
    stake: 10,
  },
  tickets: [],
  isLoading: false,
  isSaving: false,
  error: null,

  // Building ticket
  addSelection: (selection: TicketSelection) => {
    const { currentTicket } = get();

    // Check if already has a selection for this match
    const existingIndex = currentTicket.selections.findIndex(
      (s) => s.matchId === selection.matchId
    );

    let newSelections: TicketSelection[];
    if (existingIndex >= 0) {
      // Replace existing selection
      newSelections = [...currentTicket.selections];
      newSelections[existingIndex] = selection;
    } else {
      // Add new selection
      newSelections = [...currentTicket.selections, selection];
    }

    set({
      currentTicket: {
        ...currentTicket,
        selections: newSelections,
      },
    });

    // Persist to storage
    get().persistCurrentTicket();
  },

  removeSelection: (matchId: number) => {
    const { currentTicket } = get();

    set({
      currentTicket: {
        ...currentTicket,
        selections: currentTicket.selections.filter((s) => s.matchId !== matchId),
      },
    });

    get().persistCurrentTicket();
  },

  updateStake: (stake: number) => {
    const { currentTicket } = get();

    set({
      currentTicket: {
        ...currentTicket,
        stake: Math.max(1, stake),
      },
    });

    get().persistCurrentTicket();
  },

  clearTicket: () => {
    set({
      currentTicket: {
        selections: [],
        stake: 10,
      },
    });

    AsyncStorage.removeItem(STORAGE_KEY);
  },

  // API actions
  loadTickets: async () => {
    try {
      set({ isLoading: true, error: null });
      const tickets = await ticketsService.getTickets();
      set({ tickets });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load tickets' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveTicket: async () => {
    const { currentTicket } = get();

    if (currentTicket.selections.length === 0) {
      set({ error: 'No selections to save' });
      return null;
    }

    try {
      set({ isSaving: true, error: null });

      const totalOdds = get().getTotalOdds();
      const potentialWin = get().getPotentialWin();

      const ticket = await ticketsService.createTicket({
        selections: currentTicket.selections,
        totalOdds,
        stake: currentTicket.stake,
        potentialWin,
      });

      // Add to tickets list
      set((state) => ({
        tickets: [ticket, ...state.tickets],
      }));

      // Clear current ticket
      get().clearTicket();

      return ticket;
    } catch (error: any) {
      set({ error: error.message || 'Failed to save ticket' });
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  deleteTicket: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await ticketsService.deleteTicket(id);

      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id),
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete ticket' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Persistence
  loadCurrentTicket: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          currentTicket: {
            selections: parsed.selections || [],
            stake: parsed.stake || 10,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load current ticket:', error);
    }
  },

  persistCurrentTicket: async () => {
    try {
      const { currentTicket } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentTicket));
    } catch (error) {
      console.error('Failed to persist current ticket:', error);
    }
  },

  // Helpers
  hasSelection: (matchId: number) => {
    return get().currentTicket.selections.some((s) => s.matchId === matchId);
  },

  getSelection: (matchId: number) => {
    return get().currentTicket.selections.find((s) => s.matchId === matchId);
  },

  getTotalOdds: () => {
    const { currentTicket } = get();
    if (currentTicket.selections.length === 0) return 1;

    return currentTicket.selections.reduce((acc, sel) => acc * sel.odds, 1);
  },

  getPotentialWin: () => {
    const { currentTicket } = get();
    return currentTicket.stake * get().getTotalOdds();
  },

  getSelectionCount: () => {
    return get().currentTicket.selections.length;
  },

  clearError: () => set({ error: null }),
}));
