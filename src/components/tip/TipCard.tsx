import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../common/Card';
import { TeamLogo } from '../common/TeamLogo';
import { Badge, ConfidenceBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { Colors, Spacing, BorderRadius, Gradients } from '../../constants/theme';
import { getTipCategoryDisplay, getConfidenceLevel } from '../../stores/tipsStore';
import type { BettingTip } from '../../types';

interface TipCardProps {
  tip: BettingTip;
  variant?: 'default' | 'featured' | 'compact';
  onPress?: () => void;
  onUnlock?: () => void;
  isUnlocking?: boolean;
}

export const TipCard: React.FC<TipCardProps> = ({
  tip,
  variant = 'default',
  onPress,
  onUnlock,
  isUnlocking = false,
}) => {
  const confidenceLevel = getConfidenceLevel(tip.confidence);
  const categoryDisplay = getTipCategoryDisplay(tip.category);

  if (variant === 'featured') {
    return (
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={Gradients.predictions}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredContainer}
        >
          <View style={styles.featuredHeader}>
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color={Colors.backgroundPrimary} />
              <Text style={styles.featuredBadgeText}>TIP OF THE DAY</Text>
            </View>
            <ConfidenceBadge confidence={tip.confidence} />
          </View>

          <View style={styles.matchInfo}>
            <View style={styles.teamRow}>
              <TeamLogo uri={tip.match.homeTeam.logo} size="md" />
              <Text style={styles.featuredTeamName}>{tip.match.homeTeam.name}</Text>
            </View>
            <Text style={styles.featuredVs}>vs</Text>
            <View style={styles.teamRow}>
              <TeamLogo uri={tip.match.awayTeam.logo} size="md" />
              <Text style={styles.featuredTeamName}>{tip.match.awayTeam.name}</Text>
            </View>
          </View>

          <View style={styles.featuredTip}>
            <Text style={styles.featuredCategory}>{categoryDisplay}</Text>
            {tip.isUnlocked ? (
              <Text style={styles.featuredTipText}>{tip.tip}</Text>
            ) : (
              <View style={styles.lockedTip}>
                <Ionicons name="lock-closed" size={18} color={Colors.backgroundPrimary} />
                <Text style={styles.lockedText}>Unlock to reveal</Text>
              </View>
            )}
          </View>

          <View style={styles.featuredFooter}>
            <View style={styles.oddsInfo}>
              <Text style={styles.oddsLabel}>Odds</Text>
              <Text style={styles.oddsValue}>{tip.odds.toFixed(2)}</Text>
            </View>
            {!tip.isUnlocked && onUnlock && (
              <Button
                title="Unlock Tip"
                onPress={onUnlock}
                variant="secondary"
                size="md"
                loading={isUnlocking}
                icon={<Ionicons name="lock-open" size={16} color={Colors.textPrimary} />}
              />
            )}
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Card variant="default" padding="none" onPress={onPress}>
      <Pressable style={styles.container} onPress={onPress}>
        {/* Header */}
        <View style={styles.header}>
          <Badge
            text={confidenceLevel.toUpperCase()}
            variant={confidenceLevel === 'strong' ? 'success' : confidenceLevel === 'moderate' ? 'warning' : 'info'}
            size="sm"
          />
          <ConfidenceBadge confidence={tip.confidence} />
        </View>

        {/* Match Info */}
        <View style={styles.matchSection}>
          <View style={styles.teamsInfo}>
            <TeamLogo uri={tip.match.homeTeam.logo} size="sm" />
            <Text style={styles.teamNames} numberOfLines={1}>
              {tip.match.homeTeam.shortName || tip.match.homeTeam.name} vs{' '}
              {tip.match.awayTeam.shortName || tip.match.awayTeam.name}
            </Text>
            <TeamLogo uri={tip.match.awayTeam.logo} size="sm" />
          </View>
          <Text style={styles.matchTime}>
            {format(new Date(tip.match.date), 'dd MMM, HH:mm')}
          </Text>
        </View>

        {/* Tip Content */}
        <View style={styles.tipSection}>
          <Text style={styles.category}>{categoryDisplay}</Text>
          {tip.isUnlocked ? (
            <>
              <Text style={styles.tipText}>{tip.tip}</Text>
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Odds</Text>
                  <Text style={styles.detailValue}>{tip.odds.toFixed(2)}</Text>
                </View>
                {tip.ev && tip.ev > 0 && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>EV</Text>
                    <Text style={[styles.detailValue, styles.evPositive]}>
                      +{(tip.ev * 100).toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.lockedContainer}>
              <View style={styles.lockedContent}>
                <Ionicons name="lock-closed" size={20} color={Colors.accentGold} />
                <Text style={styles.lockedHint}>
                  Unlock to see our {confidenceLevel} pick
                </Text>
              </View>
              {onUnlock && (
                <Button
                  title="Unlock"
                  onPress={onUnlock}
                  variant="gradient"
                  size="sm"
                  loading={isUnlocking}
                  gradientColors={Gradients.premium}
                />
              )}
            </View>
          )}
        </View>

        {/* Reasoning (if unlocked) */}
        {tip.isUnlocked && tip.reasoning && (
          <View style={styles.reasoningSection}>
            <Text style={styles.reasoning} numberOfLines={2}>
              {tip.reasoning}
            </Text>
          </View>
        )}
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  matchSection: {
    marginBottom: Spacing.lg,
  },
  teamsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  teamNames: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  matchTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  tipSection: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  category: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing['2xl'],
  },
  detailItem: {
    gap: Spacing.xs,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  evPositive: {
    color: Colors.accentPrimary,
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  lockedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  lockedHint: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reasoningSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  reasoning: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Featured styles
  featuredContainer: {
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    overflow: 'hidden',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.backgroundPrimary,
    letterSpacing: 0.5,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  teamRow: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  featuredTeamName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.backgroundPrimary,
  },
  featuredVs: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '500',
  },
  featuredTip: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  featuredCategory: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.6)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  featuredTipText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.backgroundPrimary,
    textAlign: 'center',
  },
  lockedTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  lockedText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.backgroundPrimary,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  oddsInfo: {
    gap: Spacing.xs,
  },
  oddsLabel: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.6)',
    fontWeight: '500',
  },
  oddsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.backgroundPrimary,
  },
});

export default TipCard;
