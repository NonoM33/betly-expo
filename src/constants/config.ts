// Environment configuration
export const Config = {
  // API Configuration
  API_BASE_URL: 'https://api.betly.fr',
  API_TIMEOUT: 30000, // 30 seconds

  // Google Sign In
  GOOGLE_CLIENT_ID_IOS: '114247778518-9jkoc6hbrufm5c2evndovu0041hr70ni.apps.googleusercontent.com',
  GOOGLE_CLIENT_ID_WEB: '114247778518-n8goo09v5ldusi38g41rjlqlhc6o4ja5.apps.googleusercontent.com',

  // RevenueCat
  REVENUECAT_API_KEY_IOS: 'appl_swccyTOHakJrcUurwQtpqXuPZIo',
  REVENUECAT_API_KEY_ANDROID: '', // Set in RevenueCat dashboard

  // OneSignal
  ONESIGNAL_APP_ID: '13a823e7-8b35-4cc6-b8e2-8b96b7904303',

  // Groq AI
  GROQ_API_KEY: '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',
  GROQ_MODEL: 'openai/gpt-oss-120b',

  // Feature Flags
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  IS_DEBUG: __DEV__,

  // App Info
  APP_VERSION: '1.2.0',
  BUILD_NUMBER: '26',
} as const;

// Storage Keys
export const StorageKeys = {
  AUTH_TOKEN: 'betly_auth_token',
  USER_DATA: 'betly_user_data',
  ONBOARDING_COMPLETED: 'betly_onboarding_completed',
  FAVORITE_TEAMS: 'betly_favorite_teams',
  FAVORITE_LEAGUES: 'betly_favorite_leagues',
  RECENT_SEARCHES: 'betly_recent_searches',
  NOTIFICATION_PREFERENCES: 'betly_notification_prefs',
  GAMIFICATION_DATA: 'betly_gamification_data',
  REFERRAL_CODE: 'betly_referral_code',
} as const;

// Content Types for Credits
export const ContentType = {
  MATCH_PREDICTION: 'match_prediction',
  TIP: 'tip',
  PARLAY: 'parlay',
  AI_CHAT: 'ai_chat',
  VALUE_BET: 'value_bet',
  TEAM_ANALYSIS: 'team_analysis',
  PLAYER_ANALYSIS: 'player_analysis',
} as const;

// Subscription Tiers
export const SubscriptionTier = {
  FREE: 'free',
  PREMIUM: 'premium',
  VIP: 'vip',
  EXPERT: 'expert',
} as const;

// Match Status
export const MatchStatus = {
  TBD: 'TBD',
  NS: 'NS', // Not Started
  '1H': '1H', // First Half
  HT: 'HT', // Half Time
  '2H': '2H', // Second Half
  ET: 'ET', // Extra Time
  BT: 'BT', // Break Time
  P: 'P', // Penalties
  SUSP: 'SUSP', // Suspended
  INT: 'INT', // Interrupted
  FT: 'FT', // Full Time
  AET: 'AET', // After Extra Time
  PEN: 'PEN', // Penalties Finished
  PST: 'PST', // Postponed
  CANC: 'CANC', // Cancelled
  ABD: 'ABD', // Abandoned
  AWD: 'AWD', // Awarded
  WO: 'WO', // Walkover
  LIVE: 'LIVE',
} as const;

// Tip Categories
export const TipCategory = {
  WINNER: 'winner',
  OVER_UNDER: 'over_under',
  BTTS: 'btts',
  DOUBLE_CHANCE: 'double_chance',
  CORRECT_SCORE: 'correct_score',
  HANDICAP: 'handicap',
} as const;

// Tip Confidence Levels
export const TipConfidence = {
  STRONG: 'strong',
  MODERATE: 'moderate',
  SPECULATIVE: 'speculative',
} as const;
