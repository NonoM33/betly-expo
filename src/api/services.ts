import { get, post, put, del } from './client';
import { Endpoints } from '../constants/endpoints';
import type {
  User,
  AuthResponse,
  Match,
  MatchWithOdds,
  MatchDetails,
  Prediction,
  BettingTip,
  TipsResponse,
  CreditBalance,
  CreditPack,
  CreditTransaction,
  CreditCosts,
  ContentUnlockStatus,
  AITokenUsage,
  AIChatMessage,
  Team,
  TeamFull,
  Player,
  PlayerStats,
  League,
  LeagueStanding,
  Ticket,
  Portfolio,
  NewsArticle,
  SearchResponse,
  ValueBet,
  LeaderboardEntry,
  ReferralStats,
  UserPreferences,
  GamificationData,
  H2HData,
  MatchDuJour,
} from '../types';

// ============ AUTH SERVICES ============
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return post(Endpoints.AUTH_LOGIN, { email, password });
  },

  async register(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    return post(Endpoints.AUTH_REGISTER, { email, password, displayName });
  },

  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    return post(Endpoints.AUTH_GOOGLE, { idToken });
  },

  async loginWithApple(identityToken: string, authorizationCode: string, user?: { email?: string; fullName?: { givenName?: string; familyName?: string } }): Promise<AuthResponse> {
    return post(Endpoints.AUTH_APPLE, { identityToken, authorizationCode, user });
  },

  async getCurrentUser(): Promise<User> {
    return get(Endpoints.AUTH_ME);
  },

  async logout(): Promise<void> {
    return post(Endpoints.AUTH_LOGOUT);
  },

  async updatePreferences(preferences: UserPreferences): Promise<User> {
    return post(Endpoints.AUTH_PREFERENCES, preferences);
  },

  async registerFcmToken(token: string): Promise<void> {
    return post(Endpoints.AUTH_FCM_TOKEN, { token });
  },
};

// ============ MATCHES SERVICES ============
export const matchesService = {
  async getMatches(date?: string): Promise<MatchWithOdds[]> {
    const url = date ? Endpoints.matchesByDate(date) : Endpoints.MATCHES;
    return get(url);
  },

  async getMatchById(id: number): Promise<MatchDetails> {
    return get(Endpoints.matchById(id));
  },

  async getLiveMatches(): Promise<MatchWithOdds[]> {
    return get(Endpoints.MATCHES_LIVE);
  },

  async getH2H(team1Id: number, team2Id: number): Promise<H2HData> {
    return get(Endpoints.h2h(team1Id, team2Id));
  },
};

// ============ PREDICTIONS SERVICES ============
export const predictionsService = {
  async getPrediction(matchId: number): Promise<Prediction> {
    return get(Endpoints.prediction(matchId));
  },

  async unlockPrediction(matchId: number): Promise<Prediction> {
    return post(Endpoints.unlockPrediction(matchId));
  },

  async getAIAnalysis(matchId: number): Promise<string> {
    return get(Endpoints.aiAnalysis(matchId));
  },
};

// ============ TIPS SERVICES ============
export const tipsService = {
  async getTips(): Promise<TipsResponse> {
    return get(Endpoints.TIPS);
  },

  async getDailyTips(): Promise<BettingTip[]> {
    return get(Endpoints.TIPS_DAILY);
  },

  async getMatchDuJour(): Promise<MatchDuJour> {
    return get(Endpoints.MATCH_DU_JOUR);
  },

  async getTipById(id: string): Promise<BettingTip> {
    return get(Endpoints.tipById(id));
  },

  async unlockTip(id: string): Promise<BettingTip> {
    return post(Endpoints.unlockTip(id));
  },

  async getParlays(): Promise<BettingTip[]> {
    return get(Endpoints.TIPS_PARLAYS);
  },
};

// ============ CREDITS SERVICES ============
export const creditsService = {
  async getBalance(): Promise<CreditBalance> {
    return get(Endpoints.CREDITS_BALANCE);
  },

  async getHistory(): Promise<CreditTransaction[]> {
    return get(Endpoints.CREDITS_HISTORY);
  },

  async getPacks(): Promise<CreditPack[]> {
    return get(Endpoints.CREDITS_PACKS);
  },

  async getCosts(): Promise<CreditCosts> {
    return get(Endpoints.CREDITS_COSTS);
  },

  async checkUnlock(contentType: string, contentId: string): Promise<ContentUnlockStatus> {
    return get(Endpoints.creditsCheck(contentType, contentId));
  },

  async spend(contentType: string, contentId: string): Promise<CreditBalance> {
    return post(Endpoints.CREDITS_SPEND, { contentType, contentId });
  },
};

// ============ TEAMS SERVICES ============
export const teamsService = {
  async getTeam(id: number): Promise<Team> {
    return get(Endpoints.team(id));
  },

  async getTeamFull(id: number): Promise<TeamFull> {
    return get(Endpoints.teamFull(id));
  },

  async getTeamStats(id: number): Promise<any> {
    return get(Endpoints.teamStats(id));
  },

  async getTeamFixtures(id: number): Promise<Match[]> {
    return get(Endpoints.teamFixtures(id));
  },

  async getTeamForm(id: number): Promise<string> {
    return get(Endpoints.teamForm(id));
  },

  async getTeamInjuries(id: number): Promise<any[]> {
    return get(Endpoints.teamInjuries(id));
  },

  async getTeamSquad(id: number): Promise<Player[]> {
    return get(Endpoints.teamSquad(id));
  },
};

// ============ PLAYERS SERVICES ============
export const playersService = {
  async getPlayer(id: number): Promise<Player> {
    return get(Endpoints.player(id));
  },

  async getPlayerStats(id: number): Promise<PlayerStats> {
    return get(Endpoints.playerStats(id));
  },

  async searchPlayers(query: string): Promise<Player[]> {
    return get(Endpoints.playersSearch(query));
  },
};

// ============ LEAGUES SERVICES ============
export const leaguesService = {
  async getLeagues(): Promise<League[]> {
    return get(Endpoints.LEAGUES);
  },

  async getLeague(id: number): Promise<League> {
    return get(Endpoints.leagueById(id));
  },

  async getStandings(id: number): Promise<LeagueStanding[]> {
    return get(Endpoints.leagueStandings(id));
  },
};

// ============ TICKETS SERVICES ============
export const ticketsService = {
  async getTickets(): Promise<Ticket[]> {
    return get(Endpoints.TICKETS);
  },

  async getTicketById(id: string): Promise<Ticket> {
    return get(Endpoints.ticketById(id));
  },

  async createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'>): Promise<Ticket> {
    return post(Endpoints.TICKETS, ticket);
  },

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
    return put(Endpoints.ticketById(id), data);
  },

  async deleteTicket(id: string): Promise<void> {
    return del(Endpoints.ticketById(id));
  },
};

// ============ PORTFOLIO SERVICES ============
export const portfolioService = {
  async getPortfolio(): Promise<Portfolio> {
    return get(Endpoints.PORTFOLIO);
  },

  async getStats(): Promise<any> {
    return get(Endpoints.PORTFOLIO_STATS);
  },
};

// ============ AI CHAT SERVICES ============
export const aiChatService = {
  async getUsage(): Promise<AITokenUsage> {
    return get(Endpoints.AI_CHAT_USAGE);
  },

  async convertCredits(): Promise<AITokenUsage> {
    return post(Endpoints.AI_CHAT_CONVERT_CREDITS);
  },

  async getHistory(matchId: number): Promise<AIChatMessage[]> {
    return get(Endpoints.aiChatHistory(matchId));
  },

  async sendMessage(matchId: number, message: string): Promise<AIChatMessage> {
    return post(Endpoints.aiChatMessage(matchId), { message });
  },

  async deleteConversation(matchId: number): Promise<void> {
    return del(Endpoints.aiChatDelete(matchId));
  },

  async updateTicketStatus(messageId: string, status: 'accepted' | 'declined'): Promise<void> {
    return put(Endpoints.aiChatTicketStatus(messageId), { status });
  },
};

// ============ SEARCH SERVICES ============
export const searchService = {
  async search(query: string): Promise<SearchResponse> {
    return get(`${Endpoints.SEARCH}?q=${encodeURIComponent(query)}`);
  },
};

// ============ NEWS SERVICES ============
export const newsService = {
  async getNews(): Promise<NewsArticle[]> {
    return get(Endpoints.NEWS);
  },

  async getNewsById(id: string): Promise<NewsArticle> {
    return get(Endpoints.newsById(id));
  },

  async getNewsContent(id: string): Promise<string> {
    return get(Endpoints.newsContent(id));
  },
};

// ============ VALUE BETS SERVICES ============
export const valueBetsService = {
  async getValueBets(): Promise<ValueBet[]> {
    return get(Endpoints.VALUE_BETS);
  },
};

// ============ LEADERBOARD SERVICES ============
export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return get(Endpoints.LEADERBOARD);
  },
};

// ============ REFERRALS SERVICES ============
export const referralsService = {
  async getStats(): Promise<ReferralStats> {
    return get(Endpoints.REFERRALS_STATS);
  },

  async getWeekendStatus(): Promise<any> {
    return get(Endpoints.REFERRALS_WEEKEND_STATUS);
  },

  async share(): Promise<string> {
    return post(Endpoints.REFERRALS_SHARE);
  },

  async claimReward(rewardId: string): Promise<any> {
    return post(Endpoints.REFERRALS_CLAIM_REWARD, { rewardId });
  },

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    return get(Endpoints.referralsLeaderboard(limit));
  },
};

// ============ PUSH NOTIFICATIONS SERVICES ============
export const pushService = {
  async register(playerId: string): Promise<void> {
    return post(Endpoints.PUSH_REGISTER, { playerId });
  },

  async unregister(): Promise<void> {
    return post(Endpoints.PUSH_UNREGISTER);
  },

  async updatePreferences(preferences: any): Promise<void> {
    return post(Endpoints.PUSH_PREFERENCES, preferences);
  },
};

// ============ STRIPE SERVICES ============
export const stripeService = {
  async createSubscriptionCheckout(priceId: string): Promise<{ url: string }> {
    return post(Endpoints.STRIPE_CHECKOUT_SUBSCRIPTION, { priceId });
  },

  async createCreditsCheckout(packId: string): Promise<{ url: string }> {
    return post(Endpoints.STRIPE_CHECKOUT_CREDITS, { packId });
  },

  async getBillingPortal(): Promise<{ url: string }> {
    return get(Endpoints.STRIPE_BILLING_PORTAL);
  },

  async verifySubscription(): Promise<User> {
    return post(Endpoints.STRIPE_VERIFY_SUBSCRIPTION);
  },
};
