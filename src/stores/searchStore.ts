import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchService } from '../api/services';
import { StorageKeys } from '../constants/config';
import type { SearchResult, SearchResponse } from '../types';

const MAX_RECENT_SEARCHES = 10;

interface SearchState {
  // State
  query: string;
  results: SearchResult[];
  recentSearches: string[];
  isLoading: boolean;
  hasSearched: boolean;
  error: string | null;

  // Actions
  search: (query: string) => Promise<void>;
  setQuery: (query: string) => void;
  clearResults: () => void;
  loadRecentSearches: () => Promise<void>;
  addRecentSearch: (query: string) => Promise<void>;
  removeRecentSearch: (query: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;
  clearError: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  recentSearches: [],
  isLoading: false,
  hasSearched: false,
  error: null,

  search: async (query: string) => {
    if (!query.trim()) {
      set({ results: [], hasSearched: false });
      return;
    }

    try {
      set({ isLoading: true, error: null, query });

      const response: SearchResponse = await searchService.search(query);

      set({
        results: response.results,
        hasSearched: true,
      });

      // Add to recent searches
      await get().addRecentSearch(query);
    } catch (error: any) {
      set({ error: error.message || 'Search failed' });
    } finally {
      set({ isLoading: false });
    }
  },

  setQuery: (query: string) => {
    set({ query });
  },

  clearResults: () => {
    set({ query: '', results: [], hasSearched: false, error: null });
  },

  loadRecentSearches: async () => {
    try {
      const stored = await AsyncStorage.getItem(StorageKeys.RECENT_SEARCHES);
      if (stored) {
        const recentSearches = JSON.parse(stored);
        set({ recentSearches });
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  },

  addRecentSearch: async (query: string) => {
    try {
      const current = get().recentSearches;
      const trimmed = query.trim();

      // Remove if already exists
      const filtered = current.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());

      // Add to front and limit
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(StorageKeys.RECENT_SEARCHES, JSON.stringify(updated));
      set({ recentSearches: updated });
    } catch (error) {
      console.error('Failed to add recent search:', error);
    }
  },

  removeRecentSearch: async (query: string) => {
    try {
      const current = get().recentSearches;
      const updated = current.filter((s) => s !== query);

      await AsyncStorage.setItem(StorageKeys.RECENT_SEARCHES, JSON.stringify(updated));
      set({ recentSearches: updated });
    } catch (error) {
      console.error('Failed to remove recent search:', error);
    }
  },

  clearRecentSearches: async () => {
    try {
      await AsyncStorage.removeItem(StorageKeys.RECENT_SEARCHES);
      set({ recentSearches: [] });
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper to get search result icon
export const getSearchResultIcon = (type: SearchResult['type']): string => {
  switch (type) {
    case 'team':
      return 'shield-outline';
    case 'match':
      return 'football-outline';
    case 'player':
      return 'person-outline';
    case 'league':
      return 'trophy-outline';
    case 'venue':
      return 'location-outline';
    case 'coach':
      return 'people-outline';
    default:
      return 'search-outline';
  }
};

// Helper to get search result route
export const getSearchResultRoute = (result: SearchResult): string => {
  switch (result.type) {
    case 'team':
      return `/team/${result.id}`;
    case 'match':
      return `/match/${result.id}`;
    case 'player':
      return `/player/${result.id}`;
    case 'league':
      return `/league/${result.id}`;
    default:
      return '/';
  }
};
