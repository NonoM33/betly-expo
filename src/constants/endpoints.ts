// API Endpoints - Matching Flutter app exactly
export const Endpoints = {
  // ============ AUTH ============
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_GOOGLE: '/api/auth/google',
  AUTH_APPLE: '/api/auth/apple',
  AUTH_ME: '/api/auth/me',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_PREFERENCES: '/api/auth/preferences',
  AUTH_FCM_TOKEN: '/api/auth/fcm-token',

  // ============ MATCHES ============
  MATCHES: '/api/matches',
  matchById: (id: number) => `/api/matches/${id}`,
  matchDetails: (id: number) => `/api/matches/${id}`,
  MATCHES_LIVE: '/api/matches/live',
  matchesByDate: (date: string) => `/api/matches?date=${date}`,
  h2h: (team1Id: number, team2Id: number) => `/api/h2h/${team1Id}/${team2Id}`,

  // ============ PREDICTIONS ============
  prediction: (matchId: number) => `/api/predictions/${matchId}`,
  unlockPrediction: (matchId: number) => `/api/predictions/${matchId}/unlock`,
  aiAnalysis: (matchId: number) => `/api/predictions/${matchId}/ai-analyze`,

  // ============ TIPS ============
  TIPS: '/api/tips',
  MATCH_DU_JOUR: '/api/tips/match-du-jour',
  tipById: (id: string) => `/api/tips/${id}`,
  tipDetail: (id: string) => `/api/tips/${id}`,
  TIPS_DAILY: '/api/tips/daily',
  TIPS_PARLAYS: '/api/tips/parlays',
  unlockTip: (id: string) => `/api/tips/${id}/unlock`,

  // ============ CREDITS ============
  CREDITS_BALANCE: '/api/credits/balance',
  CREDITS_HISTORY: '/api/credits/history',
  CREDITS_PACKS: '/api/credits/packs',
  CREDITS_SPEND: '/api/credits/spend',
  CREDITS_COSTS: '/api/credits/costs',
  creditsCheck: (contentType: string, contentId: string) =>
    `/api/credits/check/${contentType}/${contentId}`,

  // ============ STRIPE ============
  STRIPE_CHECKOUT_SUBSCRIPTION: '/api/stripe/checkout/subscription',
  STRIPE_CHECKOUT_CREDITS: '/api/stripe/checkout/credits',
  STRIPE_PAYMENT_INTENT_SUBSCRIPTION: '/api/stripe/payment-intent/subscription',
  STRIPE_PAYMENT_INTENT_CREDITS: '/api/stripe/payment-intent/credits',
  STRIPE_BILLING_PORTAL: '/api/stripe/billing-portal',
  STRIPE_VERIFY_SUBSCRIPTION: '/api/stripe/verify-subscription',

  // ============ TEAMS & PLAYERS ============
  team: (id: number) => `/api/teams/${id}`,
  teamFull: (id: number) => `/api/teams/${id}/full`,
  teamStats: (id: number) => `/api/teams/${id}/stats`,
  teamFixtures: (id: number) => `/api/teams/${id}/fixtures`,
  teamForm: (id: number) => `/api/teams/${id}/form`,
  teamInjuries: (id: number) => `/api/teams/${id}/injuries`,
  teamSquad: (id: number) => `/api/teams/${id}/squad`,
  teamPlayers: (id: number) => `/api/players/team/${id}`,
  player: (id: number) => `/api/players/${id}`,
  playerStats: (id: number) => `/api/players/${id}/stats`,
  playersSearch: (query: string) => `/api/players/search?q=${encodeURIComponent(query)}`,

  // ============ LEAGUES ============
  LEAGUES: '/api/leagues',
  leagueById: (id: number) => `/api/leagues/${id}`,
  leagueStandings: (id: number) => `/api/leagues/${id}/standings`,

  // ============ LEADERBOARD ============
  LEADERBOARD: '/api/leaderboard',

  // ============ PORTFOLIO ============
  PORTFOLIO: '/api/portfolio',
  PORTFOLIO_STATS: '/api/portfolio/stats',

  // ============ TICKETS ============
  TICKETS: '/api/tickets',
  ticketById: (id: string) => `/api/tickets/${id}`,

  // ============ SUPPORT ============
  SUPPORT_AI_CHAT: '/api/support/ai/chat',
  SUPPORT_TICKETS: '/api/support/tickets',

  // ============ VALUE BETS ============
  VALUE_BETS: '/api/value-bets',

  // ============ SEARCH ============
  SEARCH: '/api/search',

  // ============ PUSH NOTIFICATIONS ============
  PUSH_REGISTER: '/api/push/register',
  PUSH_UNREGISTER: '/api/push/unregister',
  PUSH_PREFERENCES: '/api/push/preferences',

  // ============ AI MATCH CHAT (EXPERT) ============
  AI_CHAT_USAGE: '/api/ai-chat/usage',
  AI_CHAT_CONVERT_CREDITS: '/api/ai-chat/convert-credits',
  aiChatHistory: (matchId: number) => `/api/ai-chat/match/${matchId}/history`,
  aiChatMessage: (matchId: number) => `/api/ai-chat/match/${matchId}/message`,
  aiChatDelete: (matchId: number) => `/api/ai-chat/match/${matchId}`,
  aiChatTicketStatus: (messageId: string) => `/api/ai-chat/ticket-proposal/${messageId}/status`,

  // ============ NEWS ============
  NEWS: '/api/news',
  newsById: (id: string) => `/api/news/${id}`,
  newsContent: (id: string) => `/api/news/${id}/content`,

  // ============ REFERRALS ============
  REFERRALS_STATS: '/api/referrals/stats',
  REFERRALS_WEEKEND_STATUS: '/api/referrals/weekend-status',
  REFERRALS_SHARE: '/api/referrals/share',
  REFERRALS_CLAIM_REWARD: '/api/referrals/claim-reward',
  referralsLeaderboard: (limit: number) => `/api/referrals/leaderboard?limit=${limit}`,
} as const;
