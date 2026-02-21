import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  HAS_SEEN_INTRO: 'onboarding_has_seen_intro',
  HAS_COMPLETED_V2: 'onboarding_has_completed_v2',
  HAS_SEEN_AI_CHAT: 'onboarding_has_seen_ai_chat',
  HAS_SEEN_TICKET: 'onboarding_has_seen_ticket',
  HAS_SEEN_FEED_TUTORIAL: 'onboarding_has_seen_feed_tutorial',
  HAS_COMPLETED_PROFILING: 'onboarding_has_completed_profiling',
  FAVORITE_TEAMS: 'onboarding_favorite_teams',
  BETTOR_PROFILE: 'onboarding_bettor_profile',
};

export interface BettorProfile {
  level: 'beginner' | 'intermediate' | 'advanced';
  frequency: 'occasional' | 'regular' | 'daily';
  style: 'prudent' | 'balanced' | 'aggressive';
  needs: string[];
}

interface OnboardingState {
  // State
  hasSeenIntro: boolean;
  hasCompletedV2: boolean;
  hasSeenAIChat: boolean;
  hasSeenTicket: boolean;
  hasSeenFeedTutorial: boolean;
  hasCompletedProfiling: boolean;
  favoriteTeams: number[];
  bettorProfile: BettorProfile | null;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  setIntroSeen: () => Promise<void>;
  setV2Completed: (teams: number[]) => Promise<void>;
  setAIChatSeen: () => Promise<void>;
  setTicketSeen: () => Promise<void>;
  setFeedTutorialSeen: () => Promise<void>;
  setProfilingCompleted: (profile: BettorProfile) => Promise<void>;
  reset: () => Promise<void>;

  // Helpers
  shouldShowIntro: () => boolean;
  shouldShowTeamSelection: () => boolean;
  shouldShowAIChatOnboarding: () => boolean;
  shouldShowTicketOnboarding: () => boolean;
  shouldShowFeedTutorial: () => boolean;
  shouldShowProfiling: () => boolean;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasSeenIntro: false,
  hasCompletedV2: false,
  hasSeenAIChat: false,
  hasSeenTicket: false,
  hasSeenFeedTutorial: false,
  hasCompletedProfiling: false,
  favoriteTeams: [],
  bettorProfile: null,
  isLoading: true,

  initialize: async () => {
    try {
      set({ isLoading: true });

      const [
        hasSeenIntro,
        hasCompletedV2,
        hasSeenAIChat,
        hasSeenTicket,
        hasSeenFeedTutorial,
        hasCompletedProfiling,
        favoriteTeamsStr,
        bettorProfileStr,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_INTRO),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_V2),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_AI_CHAT),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_TICKET),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_FEED_TUTORIAL),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_PROFILING),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_TEAMS),
        AsyncStorage.getItem(STORAGE_KEYS.BETTOR_PROFILE),
      ]);

      let favoriteTeams: number[] = [];
      if (favoriteTeamsStr) {
        try {
          favoriteTeams = JSON.parse(favoriteTeamsStr);
        } catch {
          // Ignore
        }
      }

      let bettorProfile: BettorProfile | null = null;
      if (bettorProfileStr) {
        try {
          bettorProfile = JSON.parse(bettorProfileStr);
        } catch {
          // Ignore
        }
      }

      set({
        hasSeenIntro: hasSeenIntro === 'true',
        hasCompletedV2: hasCompletedV2 === 'true',
        hasSeenAIChat: hasSeenAIChat === 'true',
        hasSeenTicket: hasSeenTicket === 'true',
        hasSeenFeedTutorial: hasSeenFeedTutorial === 'true',
        hasCompletedProfiling: hasCompletedProfiling === 'true',
        favoriteTeams,
        bettorProfile,
      });
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setIntroSeen: async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_INTRO, 'true');
    set({ hasSeenIntro: true });
  },

  setV2Completed: async (teams: number[]) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_V2, 'true'),
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_TEAMS, JSON.stringify(teams)),
    ]);
    set({ hasCompletedV2: true, favoriteTeams: teams });
  },

  setAIChatSeen: async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_AI_CHAT, 'true');
    set({ hasSeenAIChat: true });
  },

  setTicketSeen: async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_TICKET, 'true');
    set({ hasSeenTicket: true });
  },

  setFeedTutorialSeen: async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_FEED_TUTORIAL, 'true');
    set({ hasSeenFeedTutorial: true });
  },

  setProfilingCompleted: async (profile: BettorProfile) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_PROFILING, 'true'),
      AsyncStorage.setItem(STORAGE_KEYS.BETTOR_PROFILE, JSON.stringify(profile)),
    ]);
    set({ hasCompletedProfiling: true, bettorProfile: profile });
  },

  reset: async () => {
    await Promise.all(
      Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key))
    );

    set({
      hasSeenIntro: false,
      hasCompletedV2: false,
      hasSeenAIChat: false,
      hasSeenTicket: false,
      hasSeenFeedTutorial: false,
      hasCompletedProfiling: false,
      favoriteTeams: [],
      bettorProfile: null,
    });
  },

  // Helpers
  shouldShowIntro: () => !get().hasSeenIntro,
  shouldShowTeamSelection: () => get().hasSeenIntro && !get().hasCompletedV2,
  shouldShowAIChatOnboarding: () => !get().hasSeenAIChat,
  shouldShowTicketOnboarding: () => !get().hasSeenTicket,
  shouldShowFeedTutorial: () => !get().hasSeenFeedTutorial,
  shouldShowProfiling: () => !get().hasCompletedProfiling,
}));
