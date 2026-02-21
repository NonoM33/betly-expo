import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { pushService } from '../api/services';

const STORAGE_KEYS = {
  PERMISSIONS_GRANTED: 'notifications_permissions_granted',
  PREFERENCES: 'notification_preferences',
  PLAYER_ID: 'onesignal_player_id',
};

export interface NotificationPreferences {
  enabled: boolean;
  dailyTips: boolean;
  matchReminders: boolean;
  liveUpdates: boolean;
  results: boolean;
  promotions: boolean;
  streakReminders: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  dailyTips: true,
  matchReminders: true,
  liveUpdates: true,
  results: true,
  promotions: false,
  streakReminders: true,
};

interface NotificationsState {
  // State
  permissionsGranted: boolean | null;
  preferences: NotificationPreferences;
  playerId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  registerDevice: (playerId: string) => Promise<void>;
  unregisterDevice: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  syncPreferencesWithServer: () => Promise<void>;
  clearError: () => void;

  // Helpers
  isEnabled: () => boolean;
  shouldShowPermissionPrompt: () => boolean;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  permissionsGranted: null,
  preferences: DEFAULT_PREFERENCES,
  playerId: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Load stored values
      const [permissionsStr, prefsStr, playerId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PERMISSIONS_GRANTED),
        AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES),
        AsyncStorage.getItem(STORAGE_KEYS.PLAYER_ID),
      ]);

      // Check current permission status
      const { status } = await Notifications.getPermissionsAsync();
      const permissionsGranted = status === 'granted';

      // Parse preferences
      let preferences = DEFAULT_PREFERENCES;
      if (prefsStr) {
        try {
          preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(prefsStr) };
        } catch {
          // Use defaults
        }
      }

      set({
        permissionsGranted,
        preferences,
        playerId,
      });

      // Store current permission state
      await AsyncStorage.setItem(
        STORAGE_KEYS.PERMISSIONS_GRANTED,
        String(permissionsGranted)
      );
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  requestPermissions: async () => {
    try {
      set({ isLoading: true, error: null });

      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';

      await AsyncStorage.setItem(STORAGE_KEYS.PERMISSIONS_GRANTED, String(granted));
      set({ permissionsGranted: granted });

      return granted;
    } catch (error: any) {
      set({ error: error.message || 'Failed to request permissions' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  registerDevice: async (playerId: string) => {
    try {
      set({ isLoading: true, error: null });

      await pushService.register(playerId);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);

      set({ playerId });
    } catch (error: any) {
      set({ error: error.message || 'Failed to register device' });
    } finally {
      set({ isLoading: false });
    }
  },

  unregisterDevice: async () => {
    try {
      set({ isLoading: true, error: null });

      await pushService.unregister();
      await AsyncStorage.removeItem(STORAGE_KEYS.PLAYER_ID);

      set({ playerId: null });
    } catch (error: any) {
      set({ error: error.message || 'Failed to unregister device' });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePreferences: async (prefs: Partial<NotificationPreferences>) => {
    try {
      const { preferences } = get();
      const newPreferences = { ...preferences, ...prefs };

      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(newPreferences)
      );

      set({ preferences: newPreferences });

      // Sync with server
      await get().syncPreferencesWithServer();
    } catch (error: any) {
      set({ error: error.message || 'Failed to update preferences' });
    }
  },

  syncPreferencesWithServer: async () => {
    try {
      const { preferences, playerId } = get();

      if (!playerId) {
        return;
      }

      await pushService.updatePreferences(preferences);
    } catch (error) {
      console.error('Failed to sync preferences with server:', error);
    }
  },

  clearError: () => set({ error: null }),

  isEnabled: () => {
    const { permissionsGranted, preferences } = get();
    return permissionsGranted === true && preferences.enabled;
  },

  shouldShowPermissionPrompt: () => {
    return get().permissionsGranted === null;
  },
}));
