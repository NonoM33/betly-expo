import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import type { Achievement } from '../../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  star: 'star',
  flame: 'flame',
  fire: 'flame',
  trophy: 'trophy',
  soccer: 'football',
  football: 'football',
  medal: 'medal',
  crown: 'ribbon',
  target: 'flag',
  brain: 'sparkles',
  bulb: 'bulb',
  ticket: 'receipt',
  robot: 'hardware-chip',
  sparkles: 'sparkles',
};

export function AchievementBadge({ achievement, size = 'medium' }: AchievementBadgeProps) {
  const isUnlocked = !!achievement.unlockedAt;

  const sizes = {
    small: { container: 48, icon: 20, title: 10 },
    medium: { container: 64, icon: 28, title: 11 },
    large: { container: 80, icon: 36, title: 12 },
  };

  const s = sizes[size];
  const iconName = ICON_MAP[achievement.icon || 'star'] || 'star';

  return (
    <View style={[styles.container, { width: s.container + 20 }]}>
      {isUnlocked ? (
        <LinearGradient
          colors={gradients.primary as [string, string]}
          style={[
            styles.badge,
            { width: s.container, height: s.container, borderRadius: s.container / 2 },
          ]}
        >
          <Ionicons name={iconName} size={s.icon} color={colors.white} />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.badge,
            styles.lockedBadge,
            { width: s.container, height: s.container, borderRadius: s.container / 2 },
          ]}
        >
          <Ionicons name={iconName} size={s.icon} color={colors.textMuted} />
        </View>
      )}
      <Text
        style={[
          styles.title,
          { fontSize: s.title },
          !isUnlocked && styles.lockedTitle,
        ]}
        numberOfLines={2}
      >
        {achievement.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lockedBadge: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  title: {
    fontWeight: '500',
    color: colors.white,
    textAlign: 'center',
  },
  lockedTitle: {
    color: colors.textMuted,
  },
});
