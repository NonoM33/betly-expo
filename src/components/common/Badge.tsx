import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius } from '../../constants/theme';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'live' | 'premium' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  gradientColors?: string[];
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'md',
  gradientColors,
  icon,
  style,
}) => {
  const badgeStyles = [
    styles.base,
    styles[size],
    styles[variant],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
  ];

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={gradientColors || [Colors.accentPrimary, Colors.gradientEmerald]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.base, styles[size], styles.gradient, style]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[styles.text, styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles], styles.textGradient]}>
          {text}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={badgeStyles}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={textStyles}>{text}</Text>
    </View>
  );
};

// Live Badge Component
export const LiveBadge: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <Badge text="LIVE" variant="live" size="sm" style={style} />
);

// Premium Badge Component
export const PremiumBadge: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <Badge text="VIP" variant="premium" size="sm" style={style} />
);

// Confidence Badge Component
export const ConfidenceBadge: React.FC<{ confidence: number; style?: ViewStyle }> = ({
  confidence,
  style,
}) => {
  let colors: string[];
  if (confidence >= 75) {
    colors = [Colors.accentPrimary, Colors.gradientEmerald];
  } else if (confidence >= 60) {
    colors = [Colors.gradientEmerald, Colors.gradientCyan];
  } else {
    colors = [Colors.info, Colors.gradientCyan];
  }

  return (
    <Badge
      text={`${confidence}%`}
      variant="gradient"
      gradientColors={colors}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  icon: {
    marginRight: 2,
  },

  // Sizes
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  // Variants
  default: {
    backgroundColor: Colors.backgroundTertiary,
  },
  success: {
    backgroundColor: `${Colors.success}20`,
  },
  warning: {
    backgroundColor: `${Colors.warning}20`,
  },
  error: {
    backgroundColor: `${Colors.error}20`,
  },
  info: {
    backgroundColor: `${Colors.info}20`,
  },
  live: {
    backgroundColor: Colors.liveBadge,
  },
  premium: {
    backgroundColor: Colors.premiumBadge,
  },
  gradient: {
    overflow: 'hidden',
  },

  // Text
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 9,
  },
  textMd: {
    fontSize: 11,
  },
  textLg: {
    fontSize: 12,
  },
  textDefault: {
    color: Colors.textSecondary,
  },
  textSuccess: {
    color: Colors.success,
  },
  textWarning: {
    color: Colors.warning,
  },
  textError: {
    color: Colors.error,
  },
  textInfo: {
    color: Colors.info,
  },
  textLive: {
    color: Colors.textPrimary,
  },
  textPremium: {
    color: Colors.backgroundPrimary,
  },
  textGradient: {
    color: Colors.backgroundPrimary,
  },
});

export default Badge;
