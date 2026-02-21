import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GamificationData, Achievement, DailyGoal } from '../types';

// Storage keys
const STORAGE_KEYS = {
  CURRENT_STREAK: 'gamification_current_streak',
  LONGEST_STREAK: 'gamification_longest_streak',
  LAST_ACTIVE_DATE: 'gamification_last_active_date',
  TOTAL_XP: 'gamification_total_xp',
  UNLOCKED_BADGES: 'gamification_unlocked_badges',
  TOTAL_PREDICTIONS: 'gamification_total_predictions',
  WINNING_PREDICTIONS: 'gamification_winning_predictions',
  DAILY_GOAL_PROGRESS: 'gamification_daily_goal_progress',
  DAILY_GOAL_DATE: 'gamification_daily_goal_date',
  TICKET_BETS_ADDED: 'gamification_ticket_bets_added',
  TICKET_BETS_MATCHING_AI: 'gamification_ticket_bets_matching_ai',
  TICKET_BETS_BEATING_AI: 'gamification_ticket_bets_beating_ai',
};

// XP rewards
export const XP_REWARDS = {
  VIEW_PREDICTION: 5,
  UNLOCK_TIP: 10,
  CONFIRM_BET: 15,
  WINNING_BET: 50,
  DAILY_LOGIN: 10,
  COMPLETE_DAILY_GOAL: 25,
  SHARE_PREDICTION: 5,
  ADD_BET: 15,
  BET_WON: 50,
  TICKET_COMPLETE: 25,
};

// Streak milestones
const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];

// Badge definitions
export const BADGES: Achievement[] = [
  { id: 'first_prediction', name: 'Première prédiction', description: 'Débloquez votre première prédiction', icon: 'star' },
  { id: 'streak_7', name: 'Semaine parfaite', description: '7 jours consécutifs', icon: 'flame' },
  { id: 'streak_30', name: 'Mois légendaire', description: '30 jours consécutifs', icon: 'trophy' },
  { id: 'winning_streak_3', name: 'Hat-trick', description: '3 paris gagnants de suite', icon: 'football' },
  { id: 'level_5', name: 'Apprenti', description: 'Atteignez le niveau 5', icon: 'medal' },
  { id: 'level_10', name: 'Expert', description: 'Atteignez le niveau 10', icon: 'crown' },
  { id: 'daily_goal_7', name: 'Régulier', description: 'Complétez 7 objectifs quotidiens', icon: 'target' },
  { id: 'ai_expert', name: 'Expert IA', description: 'Consultez 10 analyses IA', icon: 'bulb' },
  { id: 'first_ticket', name: 'Premier Ticket', description: 'Créez votre premier pari', icon: 'ticket' },
  { id: 'ai_follower', name: 'Disciple IA', description: '5 paris alignés avec l\'IA', icon: 'robot' },
  { id: 'beat_ai', name: 'Maître', description: 'Battez l\'IA sur 10 paris', icon: 'trophy' },
  { id: 'perfect_ticket', name: 'Ticket Parfait', description: 'Tous vos paris gagnants', icon: 'sparkles' },
];

interface StreakResult {
  streak: number;
  isNewDay: boolean;
  isMilestone: boolean;
  streakBroken: boolean;
  previousStreak?: number;
}

interface XPResult {
  xpGained: number;
  totalXP: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  reason: string;
}

interface DailyGoalResult {
  progress: number;
  target: number;
  justCompleted: boolean;
}

interface GamificationState {
  // Data
  data: GamificationData;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  recordActivity: () => Promise<StreakResult>;
  addXP: (amount: number, reason: string) => Promise<XPResult>;
  incrementDailyGoal: () => Promise<DailyGoalResult>;
  unlockBadge: (badgeId: string) => Promise<boolean>;
  recordPrediction: (won?: boolean) => Promise<void>;
  recordBetAdded: (matchesAI: boolean) => Promise<void>;
  recordBetResult: (userWon: boolean, aiWouldHaveWon: boolean) => Promise<void>;
  reset: () => Promise<void>;

  // Helpers
  hasBadge: (badgeId: string) => boolean;
  getLevel: () => number;
  getLevelProgress: () => number;
  getXpForNextLevel: () => number;
}

// Calculate level from XP
const calculateLevel = (xp: number): number => {
  let level = 1;
  let requiredXP = 0;
  while (xp >= requiredXP) {
    level++;
    requiredXP = xpRequiredForLevel(level);
  }
  return level - 1;
};

// XP required for a level (progressive formula)
const xpRequiredForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return 50 * level * (level - 1);
};

// Get today's date string
const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Get yesterday's date string
const getYesterdayString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
};

export const useGamificationStore = create<GamificationState>((set, get) => ({
  data: {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    dailyGoals: [
      {
        id: 'daily_predictions',
        name: 'Prédictions du jour',
        description: 'Consultez 3 prédictions',
        target: 3,
        progress: 0,
        xpReward: XP_REWARDS.COMPLETE_DAILY_GOAL,
        completed: false,
      },
    ],
  },
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Load all values from storage
      const [
        currentStreak,
        longestStreak,
        lastActiveDate,
        totalXP,
        unlockedBadges,
        dailyGoalProgress,
        dailyGoalDate,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STREAK),
        AsyncStorage.getItem(STORAGE_KEYS.LONGEST_STREAK),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE),
        AsyncStorage.getItem(STORAGE_KEYS.TOTAL_XP),
        AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_BADGES),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL_PROGRESS),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL_DATE),
      ]);

      const today = getTodayString();
      const yesterday = getYesterdayString();

      // Check if streak should be reset
      let streak = parseInt(currentStreak || '0', 10);
      if (lastActiveDate && lastActiveDate !== today && lastActiveDate !== yesterday) {
        streak = 0;
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, '0');
      }

      // Calculate daily goal progress
      let goalProgress = 0;
      if (dailyGoalDate === today) {
        goalProgress = parseInt(dailyGoalProgress || '0', 10);
      }

      const xp = parseInt(totalXP || '0', 10);
      const level = calculateLevel(xp);
      const badges = unlockedBadges ? JSON.parse(unlockedBadges) : [];

      set({
        data: {
          level,
          xp,
          xpToNextLevel: xpRequiredForLevel(level + 1) - xp,
          currentStreak: streak,
          longestStreak: parseInt(longestStreak || '0', 10),
          achievements: BADGES.map((badge) => ({
            ...badge,
            unlockedAt: badges.includes(badge.id) ? new Date().toISOString() : undefined,
          })),
          dailyGoals: [
            {
              id: 'daily_predictions',
              name: 'Prédictions du jour',
              description: 'Consultez 3 prédictions',
              target: 3,
              progress: goalProgress,
              xpReward: XP_REWARDS.COMPLETE_DAILY_GOAL,
              completed: goalProgress >= 3,
            },
          ],
          lastActivityDate: lastActiveDate || undefined,
        },
        isInitialized: true,
      });
    } catch (error) {
      console.error('Failed to initialize gamification:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  recordActivity: async () => {
    const { data } = get();
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastActive = data.lastActivityDate;

    if (lastActive === today) {
      return {
        streak: data.currentStreak,
        isNewDay: false,
        isMilestone: false,
        streakBroken: false,
      };
    }

    let newStreak: number;
    let streakBroken = false;

    if (lastActive === yesterday) {
      newStreak = data.currentStreak + 1;
    } else if (!lastActive) {
      newStreak = 1;
    } else {
      newStreak = 1;
      streakBroken = data.currentStreak > 0;
    }

    // Save to storage
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, String(newStreak));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);

    // Update longest streak
    let longestStreak = data.longestStreak;
    if (newStreak > longestStreak) {
      longestStreak = newStreak;
      await AsyncStorage.setItem(STORAGE_KEYS.LONGEST_STREAK, String(longestStreak));
    }

    const isMilestone = STREAK_MILESTONES.includes(newStreak);

    set({
      data: {
        ...data,
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: today,
      },
    });

    // Check for streak badges
    if (newStreak === 7) {
      get().unlockBadge('streak_7');
    } else if (newStreak === 30) {
      get().unlockBadge('streak_30');
    }

    return {
      streak: newStreak,
      isNewDay: true,
      isMilestone,
      streakBroken,
      previousStreak: streakBroken ? data.currentStreak : undefined,
    };
  },

  addXP: async (amount: number, reason: string) => {
    const { data } = get();
    const oldLevel = data.level;
    const newTotal = data.xp + amount;
    const newLevel = calculateLevel(newTotal);

    await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_XP, String(newTotal));

    set({
      data: {
        ...data,
        xp: newTotal,
        level: newLevel,
        xpToNextLevel: xpRequiredForLevel(newLevel + 1) - newTotal,
      },
    });

    // Check for level badges
    if (newLevel >= 5 && oldLevel < 5) {
      get().unlockBadge('level_5');
    }
    if (newLevel >= 10 && oldLevel < 10) {
      get().unlockBadge('level_10');
    }

    return {
      xpGained: amount,
      totalXP: newTotal,
      oldLevel,
      newLevel,
      leveledUp: newLevel > oldLevel,
      reason,
    };
  },

  incrementDailyGoal: async () => {
    const { data } = get();
    const today = getTodayString();
    const goalDate = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL_DATE);

    let progress: number;
    let previousProgress: number;

    if (goalDate !== today) {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL_DATE, today);
      previousProgress = 0;
      progress = 1;
    } else {
      previousProgress = data.dailyGoals[0]?.progress || 0;
      progress = Math.min(previousProgress + 1, 3);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL_PROGRESS, String(progress));

    const justCompleted = progress === 3 && previousProgress < 3;

    if (justCompleted) {
      get().addXP(XP_REWARDS.COMPLETE_DAILY_GOAL, 'daily_goal_complete');
    }

    set({
      data: {
        ...data,
        dailyGoals: [
          {
            ...data.dailyGoals[0],
            progress,
            completed: progress >= 3,
          },
        ],
      },
    });

    return {
      progress,
      target: 3,
      justCompleted,
    };
  },

  unlockBadge: async (badgeId: string) => {
    const { data } = get();
    const currentBadges = data.achievements
      .filter((a) => a.unlockedAt)
      .map((a) => a.id);

    if (currentBadges.includes(badgeId)) {
      return false;
    }

    currentBadges.push(badgeId);
    await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_BADGES, JSON.stringify(currentBadges));

    const badge = BADGES.find((b) => b.id === badgeId);

    set({
      data: {
        ...data,
        achievements: data.achievements.map((a) =>
          a.id === badgeId ? { ...a, unlockedAt: new Date().toISOString() } : a
        ),
      },
    });

    // Add badge XP reward
    if (badge) {
      // Badge XP rewards are defined in BADGES but not in the interface
      // We'll add 25 XP for any badge unlock
      get().addXP(25, `badge_${badgeId}`);
    }

    return true;
  },

  recordPrediction: async (won = false) => {
    const totalKey = STORAGE_KEYS.TOTAL_PREDICTIONS;
    const winningKey = STORAGE_KEYS.WINNING_PREDICTIONS;

    const total = parseInt((await AsyncStorage.getItem(totalKey)) || '0', 10) + 1;
    await AsyncStorage.setItem(totalKey, String(total));

    if (won) {
      const winning = parseInt((await AsyncStorage.getItem(winningKey)) || '0', 10) + 1;
      await AsyncStorage.setItem(winningKey, String(winning));
      get().addXP(XP_REWARDS.WINNING_BET, 'prediction_won');
    }

    // Check for first prediction badge
    if (total === 1) {
      get().unlockBadge('first_prediction');
    }
  },

  recordBetAdded: async (matchesAI: boolean) => {
    const countKey = STORAGE_KEYS.TICKET_BETS_ADDED;
    const count = parseInt((await AsyncStorage.getItem(countKey)) || '0', 10) + 1;
    await AsyncStorage.setItem(countKey, String(count));

    if (matchesAI) {
      const matchingKey = STORAGE_KEYS.TICKET_BETS_MATCHING_AI;
      const matching = parseInt((await AsyncStorage.getItem(matchingKey)) || '0', 10) + 1;
      await AsyncStorage.setItem(matchingKey, String(matching));

      if (matching >= 5) {
        get().unlockBadge('ai_follower');
      }
    }

    get().addXP(XP_REWARDS.ADD_BET, 'bet_added');

    if (count === 1) {
      get().unlockBadge('first_ticket');
    }
  },

  recordBetResult: async (userWon: boolean, aiWouldHaveWon: boolean) => {
    if (userWon) {
      get().addXP(XP_REWARDS.BET_WON, 'bet_won');

      if (!aiWouldHaveWon) {
        const beatingKey = STORAGE_KEYS.TICKET_BETS_BEATING_AI;
        const beating = parseInt((await AsyncStorage.getItem(beatingKey)) || '0', 10) + 1;
        await AsyncStorage.setItem(beatingKey, String(beating));

        if (beating >= 10) {
          get().unlockBadge('beat_ai');
        }
      }
    }
  },

  reset: async () => {
    await Promise.all(
      Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key))
    );

    set({
      data: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        achievements: BADGES.map((badge) => ({ ...badge })),
        dailyGoals: [
          {
            id: 'daily_predictions',
            name: 'Prédictions du jour',
            description: 'Consultez 3 prédictions',
            target: 3,
            progress: 0,
            xpReward: XP_REWARDS.COMPLETE_DAILY_GOAL,
            completed: false,
          },
        ],
      },
      isInitialized: false,
    });
  },

  hasBadge: (badgeId: string) => {
    return get().data.achievements.some((a) => a.id === badgeId && a.unlockedAt);
  },

  getLevel: () => get().data.level,

  getLevelProgress: () => {
    const { data } = get();
    const currentLevelXP = xpRequiredForLevel(data.level);
    const nextLevelXP = xpRequiredForLevel(data.level + 1);
    const progressXP = data.xp - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    return Math.min(Math.max(progressXP / requiredXP, 0), 1);
  },

  getXpForNextLevel: () => {
    const { data } = get();
    return xpRequiredForLevel(data.level + 1) - data.xp;
  },
}));
