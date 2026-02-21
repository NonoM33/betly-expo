import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { StorageKeys } from '../constants/config';
import { authService } from '../api/services';
import { setAuthToken, clearAuthToken } from '../api/client';
import type { User, SubscriptionTier } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithApple: (identityToken: string, authorizationCode: string, user?: any) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;

  // Helpers
  hasSubscription: () => boolean;
  isExpert: () => boolean;
  isVip: () => boolean;
  isPremium: () => boolean;
  getSubscriptionTier: () => SubscriptionTier;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      const token = await SecureStore.getItemAsync(StorageKeys.AUTH_TOKEN);

      if (token) {
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch (error) {
          // Token is invalid, clear it
          await clearAuthToken();
          await SecureStore.deleteItemAsync(StorageKeys.USER_DATA);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  loginWithGoogle: async (idToken: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.loginWithGoogle(idToken);
      await setAuthToken(response.token);
      await SecureStore.setItemAsync(StorageKeys.USER_DATA, JSON.stringify(response.user));

      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.message || 'Failed to sign in with Google' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithApple: async (identityToken: string, authorizationCode: string, user?: any) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.loginWithApple(identityToken, authorizationCode, user);
      await setAuthToken(response.token);
      await SecureStore.setItemAsync(StorageKeys.USER_DATA, JSON.stringify(response.user));

      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.message || 'Failed to sign in with Apple' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.login(email, password);
      await setAuthToken(response.token);
      await SecureStore.setItemAsync(StorageKeys.USER_DATA, JSON.stringify(response.user));

      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.message || 'Failed to sign in' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, displayName?: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.register(email, password, displayName);
      await setAuthToken(response.token);
      await SecureStore.setItemAsync(StorageKeys.USER_DATA, JSON.stringify(response.user));

      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.message || 'Failed to register' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });

      try {
        await authService.logout();
      } catch (error) {
        // Continue even if API call fails
        console.warn('Logout API call failed:', error);
      }

      await clearAuthToken();
      await SecureStore.deleteItemAsync(StorageKeys.USER_DATA);

      set({ user: null, isAuthenticated: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to logout' });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const user = await authService.getCurrentUser();
      await SecureStore.setItemAsync(StorageKeys.USER_DATA, JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },

  clearError: () => set({ error: null }),

  // Helpers
  hasSubscription: () => {
    const user = get().user;
    return user?.subscriptionTier !== 'free';
  },

  isExpert: () => {
    const user = get().user;
    return user?.subscriptionTier === 'expert';
  },

  isVip: () => {
    const user = get().user;
    return user?.subscriptionTier === 'vip' || user?.subscriptionTier === 'expert';
  },

  isPremium: () => {
    const user = get().user;
    return user?.subscriptionTier !== 'free';
  },

  getSubscriptionTier: () => {
    const user = get().user;
    return user?.subscriptionTier || 'free';
  },
}));
