import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import { useGamificationStore } from '../../stores';

interface LevelProgressProps {
  compact?: boolean;
}

export function LevelProgress({ compact = false }: LevelProgressProps) {
  const { data, getLevelProgress, getXpForNextLevel } = useGamificationStore();
  const progress = getLevelProgress();
  const xpNeeded = getXpForNextLevel();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactLevelBadge}>
          <Text style={styles.compactLevelText}>{data.level}</Text>
        </View>
        <View style={styles.compactProgressBar}>
          <LinearGradient
            colors={gradients.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.compactProgressFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <LinearGradient
            colors={gradients.primary as [string, string]}
            style={styles.levelGradient}
          >
            <Text style={styles.levelNumber}>{data.level}</Text>
          </LinearGradient>
          <Text style={styles.levelLabel}>Niveau</Text>
        </View>

        <View style={styles.xpInfo}>
          <Text style={styles.xpValue}>{data.xp.toLocaleString()} XP</Text>
          <Text style={styles.xpNeeded}>
            {xpNeeded.toLocaleString()} XP pour niveau {data.level + 1}
          </Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <LinearGradient
          colors={gradients.primary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelBadge: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  levelGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  levelLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
  },
  xpInfo: {
    flex: 1,
  },
  xpValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  xpNeeded: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactLevelBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  compactLevelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  compactProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
