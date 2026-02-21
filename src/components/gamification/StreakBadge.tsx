import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';

interface StreakBadgeProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
}

export function StreakBadge({ streak, size = 'medium' }: StreakBadgeProps) {
  const getStreakColor = () => {
    if (streak >= 30) return ['#FFD700', '#FFA500']; // Gold
    if (streak >= 14) return ['#9B59B6', '#8E44AD']; // Purple
    if (streak >= 7) return gradients.primary; // Green
    return [colors.surface, colors.surface]; // Default
  };

  const sizes = {
    small: { container: 24, icon: 12, text: 10 },
    medium: { container: 36, icon: 16, text: 12 },
    large: { container: 48, icon: 20, text: 14 },
  };

  const s = sizes[size];

  if (streak === 0) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getStreakColor() as [string, string]}
        style={[styles.badge, { width: s.container, height: s.container, borderRadius: s.container / 2 }]}
      >
        <Ionicons name="flame" size={s.icon} color={colors.white} />
      </LinearGradient>
      <Text style={[styles.text, { fontSize: s.text }]}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    color: colors.white,
    marginLeft: spacing.xs,
  },
});
