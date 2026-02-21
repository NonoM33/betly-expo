// Betly Theme Constants - Matching Flutter app exactly
export const Colors = {
  // Background colors
  backgroundPrimary: '#0D0D0D',
  backgroundSecondary: '#1A1A1A',
  backgroundTertiary: '#252525',

  // Border colors
  border: '#2A2A2A',
  borderLight: '#333333',

  // Accent colors
  accentPrimary: '#00D166', // Main green
  accentGold: '#F59E0B', // Credits/Premium
  accentRed: '#EF4444', // Live/Error

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textMuted: '#4B5563',

  // Status colors
  success: '#22C55E',
  successLight: '#4ADE80',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#3B82F6',
  infoLight: '#60A5FA',

  // Gradient colors
  gradientPurple: '#A855F7',
  gradientPink: '#EC4899',
  gradientOrange: '#F97316',
  gradientYellow: '#FACC15',
  gradientCyan: '#22D3EE',
  gradientEmerald: '#10B981',
  gradientViolet: '#8B5CF6',

  // AI colors (Apple Intelligence style)
  aiCyan: '#67E8F9',
  aiBlue: '#60A5FA',
  aiViolet: '#A78BFA',
  aiPurple: '#C084FC',
  aiPink: '#F472B6',
  aiOrange: '#FB923C',

  // Special colors
  liveBadge: '#FF4757',
  premiumBadge: '#FFD700',

  // Shadow colors
  shadowDark: 'rgba(0, 0, 0, 0.3)',
  shadowAccent: 'rgba(0, 209, 102, 0.3)',
  shadowGold: 'rgba(245, 158, 11, 0.3)',
  shadowRed: 'rgba(239, 68, 68, 0.2)',
} as const;

// Gradient color tuple type for LinearGradient compatibility
export type GradientColors = readonly [string, string, ...string[]];

// Gradient presets - Using tuple types for LinearGradient compatibility
export const Gradients = {
  predictions: [Colors.accentPrimary, Colors.gradientEmerald] as GradientColors,
  premium: [Colors.accentGold, Colors.gradientOrange] as GradientColors,
  vip: [Colors.gradientPurple, Colors.gradientPink] as GradientColors,
  live: [Colors.error, Colors.gradientOrange] as GradientColors,
  valueBets: [Colors.info, Colors.gradientCyan] as GradientColors,
  appleIntelligence: [
    Colors.aiCyan,
    Colors.aiBlue,
    Colors.aiViolet,
    Colors.aiPurple,
    Colors.aiPink,
    Colors.aiOrange,
  ] as GradientColors,
  aiSubtle: [Colors.aiCyan, Colors.aiViolet, Colors.aiPink] as GradientColors,
};

// Spacing
export const Spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
} as const;

// Border Radius
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Icon Sizes
export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
} as const;

// Button Heights
export const ButtonHeight = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
} as const;

// Touch Target
export const MIN_TOUCH_TARGET = 44;

// Navigation
export const BottomNavHeight = 64;
export const AppBarHeight = 56;

// Card Dimensions
export const CardDimensions = {
  matchCardHeight: 120,
  matchCardCompactHeight: 80,
  tipCardHeight: 140,
} as const;

// Team Logo Sizes
export const TeamLogoSize = {
  sm: 20,
  md: 28,
  lg: 40,
  xl: 56,
} as const;

// Avatar Sizes
export const AvatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
} as const;

// Animation Durations
export const AnimationDuration = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
} as const;

// Get confidence color based on percentage
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 75) return Colors.accentPrimary;
  if (confidence >= 60) return Colors.gradientEmerald;
  return Colors.info;
};

// Get confidence gradient based on percentage
export const getConfidenceGradient = (confidence: number): string[] => {
  if (confidence >= 75) {
    return [Colors.accentPrimary, Colors.gradientEmerald];
  }
  if (confidence >= 60) {
    return [Colors.gradientEmerald, Colors.gradientCyan];
  }
  return [Colors.info, Colors.gradientCyan];
};

// Lowercase aliases for convenience
export const colors = {
  background: Colors.backgroundPrimary,
  surface: Colors.backgroundSecondary,
  surfaceSecondary: Colors.backgroundTertiary,
  border: Colors.border,
  white: Colors.textPrimary,
  textPrimary: Colors.textPrimary,
  textSecondary: Colors.textSecondary,
  textMuted: Colors.textTertiary,
  accent: Colors.accentPrimary,
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
  info: Colors.info,
};

export const gradients = {
  primary: [Colors.accentPrimary, Colors.gradientEmerald] as [string, string],
  premium: [Colors.accentGold, Colors.gradientOrange] as [string, string],
  vip: [Colors.gradientPurple, Colors.gradientPink] as [string, string],
  live: [Colors.error, Colors.gradientOrange] as [string, string],
};

export const spacing = {
  xs: Spacing.xs,
  sm: Spacing.sm,
  md: Spacing.md,
  lg: Spacing.lg,
  xl: Spacing.xl,
};

export const borderRadius = {
  xs: BorderRadius.xs,
  sm: BorderRadius.sm,
  md: BorderRadius.md,
  lg: BorderRadius.lg,
  xl: BorderRadius.xl,
  full: BorderRadius.full,
};
