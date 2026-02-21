// ============ USER & AUTH ============
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  provider: 'google' | 'apple' | 'email';
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: string;
  createdAt: string;
  preferences?: UserPreferences;
  referralCode?: string;
}

export interface UserPreferences {
  favoriteTeams?: number[];
  favoriteLeagues?: number[];
  language?: string;
  timezone?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  dailyTips: boolean;
  matchReminders: boolean;
  liveUpdates: boolean;
  promotions: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type SubscriptionTier = 'free' | 'premium' | 'vip' | 'expert';

// ============ MATCHES ============
export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  league: League;
  date: string;
  time: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  referee?: string;
  elapsed?: number;
}

export interface MatchWithOdds extends Match {
  odds?: Odds;
  prediction?: PredictionSummary;
}

export interface MatchDetails extends Match {
  statistics?: MatchStatistics;
  lineups?: MatchLineups;
  events?: MatchEvent[];
  h2h?: H2HData;
  prediction?: Prediction;
  isUnlocked?: boolean;
}

export type MatchStatus =
  | 'TBD'
  | 'NS'
  | '1H'
  | 'HT'
  | '2H'
  | 'ET'
  | 'BT'
  | 'P'
  | 'SUSP'
  | 'INT'
  | 'FT'
  | 'AET'
  | 'PEN'
  | 'PST'
  | 'CANC'
  | 'ABD'
  | 'AWD'
  | 'WO'
  | 'LIVE';

export interface MatchStatistics {
  home: TeamMatchStats;
  away: TeamMatchStats;
}

export interface TeamMatchStats {
  possession?: number;
  shots?: number;
  shotsOnTarget?: number;
  corners?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
  offsides?: number;
  passes?: number;
  passAccuracy?: number;
}

export interface MatchLineups {
  home: TeamLineup;
  away: TeamLineup;
}

export interface TeamLineup {
  formation: string;
  startingXI: PlayerLineup[];
  substitutes: PlayerLineup[];
  coach?: Coach;
}

export interface PlayerLineup {
  playerId: number;
  playerName: string;
  number?: number;
  position?: string;
  grid?: string;
}

export interface MatchEvent {
  time: number;
  type: 'goal' | 'card' | 'substitution' | 'var';
  team: 'home' | 'away';
  player?: string;
  assist?: string;
  detail?: string;
}

export interface H2HData {
  matches: Match[];
  homeWins: number;
  awayWins: number;
  draws: number;
}

// ============ TEAMS ============
export interface Team {
  id: number;
  name: string;
  shortName?: string;
  logo?: string;
  code?: string;
  country?: string;
}

export interface TeamFull extends Team {
  founded?: number;
  venue?: Venue;
  statistics?: TeamStatistics;
  form?: string;
  squad?: Player[];
  injuries?: Injury[];
}

export interface TeamStatistics {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets?: number;
  failedToScore?: number;
}

export interface Venue {
  id: number;
  name: string;
  city?: string;
  capacity?: number;
  image?: string;
}

// ============ PLAYERS ============
export interface Player {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  position?: string;
  number?: number;
  age?: number;
  nationality?: string;
}

export interface PlayerStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  rating?: number;
}

export interface Injury {
  player: Player;
  type: string;
  reason: string;
  expectedReturn?: string;
}

export interface Coach {
  id: number;
  name: string;
  photo?: string;
  nationality?: string;
}

// ============ LEAGUES ============
export interface League {
  id: number;
  name: string;
  logo?: string;
  country?: string;
  countryFlag?: string;
  season?: number;
}

export interface LeagueStanding {
  rank: number;
  team: Team;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

// ============ PREDICTIONS ============
export interface Prediction {
  id: string;
  matchId: number;
  prediction: string;
  confidence: number;
  odds?: number;
  reasoning?: string;
  aiAnalysis?: string;
  riskAssessment?: RiskAssessment;
  factors?: PredictionFactor[];
  isUnlocked: boolean;
  createdAt: string;
}

export interface PredictionSummary {
  prediction: string;
  confidence: number;
  isUnlocked: boolean;
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
}

export interface PredictionFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description?: string;
}

// ============ TIPS ============
export interface BettingTip {
  id: string;
  matchId: number;
  match: Match;
  category: TipCategory;
  tip: string;
  odds: number;
  confidence: number;
  reasoning?: string;
  ev?: number; // Expected Value
  isUnlocked: boolean;
  createdAt: string;
}

export interface ParlayTip {
  id: string;
  name: string;
  tips: BettingTip[];
  totalOdds: number;
  confidence: number;
  stake?: number;
  potentialWin?: number;
  isUnlocked: boolean;
}

export interface TipsResponse {
  tipOfTheDay?: BettingTip;
  matchDuJour?: MatchDuJour;
  strongPicks: BettingTip[];
  moderatePicks: BettingTip[];
  parlays: ParlayTip[];
  stats?: TipsStats;
}

export interface TipsStats {
  totalTips: number;
  winRate: number;
  avgOdds: number;
  profit: number;
}

export interface MatchDuJour {
  match: Match;
  prediction?: Prediction;
  isFree: boolean;
}

export type TipCategory =
  | 'winner'
  | 'over_under'
  | 'btts'
  | 'double_chance'
  | 'correct_score'
  | 'handicap';

export type TipConfidence = 'strong' | 'moderate' | 'speculative';

// ============ ODDS ============
export interface Odds {
  home: number;
  draw: number;
  away: number;
  over25?: number;
  under25?: number;
  bttsYes?: number;
  bttsNo?: number;
  bookmaker?: string;
}

// ============ CREDITS ============
export interface CreditBalance {
  subscription: number;
  purchased: number;
  total: number;
  weeklyReset?: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  bonus?: number;
  popular?: boolean;
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'spend' | 'refund' | 'reward' | 'subscription';
  amount: number;
  description: string;
  contentType?: string;
  contentId?: string;
  createdAt: string;
}

export interface CreditCosts {
  matchPrediction: number;
  tip: number;
  parlay: number;
  aiChat: number;
  valueBet: number;
  teamAnalysis: number;
  playerAnalysis: number;
}

export interface ContentUnlockStatus {
  isUnlocked: boolean;
  cost: number;
  canAfford: boolean;
}

// ============ AI CHAT ============
export interface AITokenUsage {
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ticketProposal?: TicketProposal;
  tokensUsed?: number;
  createdAt: string;
}

export interface TicketProposal {
  id: string;
  selections: TicketSelection[];
  totalOdds: number;
  stake?: number;
  potentialWin?: number;
  reasoning: string;
  risks: string[];
  status: 'pending' | 'accepted' | 'declined';
}

export interface TicketSelection {
  matchId: number;
  match: Match;
  bet: string;
  odds: number;
}

// ============ TICKETS ============
export interface Ticket {
  id: string;
  selections: TicketSelection[];
  totalOdds: number;
  stake: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost' | 'void';
  createdAt: string;
  settledAt?: string;
}

// ============ PORTFOLIO ============
export interface Portfolio {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  winRate: number;
  totalStaked: number;
  totalWon: number;
  profit: number;
  roi: number;
}

// ============ NEWS ============
export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  source?: string;
  publishedAt: string;
  category?: string;
}

// ============ SEARCH ============
export interface SearchResult {
  type: 'team' | 'match' | 'player' | 'league' | 'venue' | 'coach';
  id: number | string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalCount: number;
}

// ============ GAMIFICATION ============
export interface GamificationData {
  level: number;
  xp: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  dailyGoals: DailyGoal[];
  lastActivityDate?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface DailyGoal {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
}

// ============ REFERRALS ============
export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingRewards: number;
  claimedRewards: number;
  weekendMultiplier?: number;
  leaderboardRank?: number;
}

export interface ReferralReward {
  id: string;
  type: 'credits' | 'subscription' | 'bonus';
  amount: number;
  status: 'pending' | 'claimable' | 'claimed';
  expiresAt?: string;
}

// ============ VALUE BETS ============
export interface ValueBet {
  id: string;
  matchId: number;
  match: Match;
  bet: string;
  bookmakerOdds: number;
  trueOdds: number;
  value: number; // percentage edge
  confidence: number;
  isUnlocked: boolean;
}

// ============ LEADERBOARD ============
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoUrl?: string;
  winRate: number;
  profit: number;
  totalBets: number;
  streak?: number;
}

// ============ API RESPONSES ============
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
  required?: number;
  available?: number;
}
