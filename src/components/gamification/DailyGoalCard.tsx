import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import { useGamificationStore } from '../../stores';

export function DailyGoalCard() {
  const { data } = useGamificationStore();
  const goal = data.dailyGoals[0];

  if (!goal) return null;

  const progress = goal.progress / goal.target;
  const isComplete = goal.completed;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isComplete ? 'checkmark-circle' : 'flag'}
            size={20}
            color={isComplete ? colors.success : colors.accent}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{goal.name}</Text>
          <Text style={styles.subtitle}>{goal.description}</Text>
        </View>
        <View style={styles.rewardContainer}>
          <Ionicons name="flash" size={12} color={colors.accent} />
          <Text style={styles.rewardText}>+{goal.xpReward} XP</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={
              isComplete
                ? ([colors.success, colors.success] as [string, string])
                : (gradients.primary as [string, string])
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {goal.progress}/{goal.target}
        </Text>
      </View>

      {isComplete && (
        <View style={styles.completeBadge}>
          <Ionicons name="checkmark" size={12} color={colors.white} />
          <Text style={styles.completeText}>Complété !</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.success,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  completeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
});
