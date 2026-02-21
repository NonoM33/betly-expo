import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '../common/Card';
import { TeamLogo } from '../common/TeamLogo';
import { Badge, LiveBadge, ConfidenceBadge } from '../common/Badge';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { isMatchLive, isMatchFinished, getStatusDisplay } from '../../stores/matchesStore';
import type { MatchWithOdds } from '../../types';

interface MatchCardProps {
  match: MatchWithOdds;
  compact?: boolean;
  showOdds?: boolean;
  showPrediction?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  compact = false,
  showOdds = true,
  showPrediction = true,
}) => {
  const router = useRouter();
  const isLive = isMatchLive(match.status);
  const isFinished = isMatchFinished(match.status);

  const handlePress = () => {
    router.push(`/match/${match.id}`);
  };

  return (
    <Card variant="default" padding="none" onPress={handlePress}>
      <Pressable style={styles.container} onPress={handlePress}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.leagueInfo}>
            {match.league.logo && (
              <TeamLogo uri={match.league.logo} size="sm" />
            )}
            <Text style={styles.leagueName} numberOfLines={1}>
              {match.league.name}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            {isLive ? (
              <LiveBadge />
            ) : (
              <Text style={styles.time}>
                {isFinished
                  ? getStatusDisplay(match.status)
                  : format(new Date(match.date), 'HH:mm')}
              </Text>
            )}
          </View>
        </View>

        {/* Teams */}
        <View style={styles.teamsContainer}>
          {/* Home Team */}
          <View style={styles.team}>
            <TeamLogo uri={match.homeTeam.logo} size={compact ? 'md' : 'lg'} />
            <Text style={styles.teamName} numberOfLines={1}>
              {match.homeTeam.name}
            </Text>
          </View>

          {/* Score or VS */}
          <View style={styles.scoreContainer}>
            {isLive || isFinished ? (
              <View style={styles.score}>
                <Text style={[styles.scoreText, isLive && styles.liveScore]}>
                  {match.homeScore ?? 0}
                </Text>
                <Text style={styles.scoreSeparator}>-</Text>
                <Text style={[styles.scoreText, isLive && styles.liveScore]}>
                  {match.awayScore ?? 0}
                </Text>
              </View>
            ) : (
              <Text style={styles.vs}>VS</Text>
            )}
            {isLive && match.elapsed && (
              <Text style={styles.elapsed}>{match.elapsed}'</Text>
            )}
          </View>

          {/* Away Team */}
          <View style={styles.team}>
            <TeamLogo uri={match.awayTeam.logo} size={compact ? 'md' : 'lg'} />
            <Text style={styles.teamName} numberOfLines={1}>
              {match.awayTeam.name}
            </Text>
          </View>
        </View>

        {/* Footer - Odds & Prediction */}
        {!compact && (showOdds || showPrediction) && (
          <View style={styles.footer}>
            {showOdds && match.odds && (
              <View style={styles.oddsContainer}>
                <OddsPill label="1" value={match.odds.home} />
                <OddsPill label="X" value={match.odds.draw} />
                <OddsPill label="2" value={match.odds.away} />
              </View>
            )}

            {showPrediction && match.prediction && (
              <View style={styles.predictionContainer}>
                {match.prediction.isUnlocked ? (
                  <>
                    <ConfidenceBadge confidence={match.prediction.confidence} />
                    <Text style={styles.predictionText} numberOfLines={1}>
                      {match.prediction.prediction}
                    </Text>
                  </>
                ) : (
                  <View style={styles.lockedPrediction}>
                    <Ionicons name="lock-closed" size={14} color={Colors.accentGold} />
                    <Text style={styles.unlockText}>AI Prediction Available</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Card>
  );
};

// Odds Pill Component
const OddsPill: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={pillStyles.container}>
    <Text style={pillStyles.label}>{label}</Text>
    <Text style={pillStyles.value}>{value.toFixed(2)}</Text>
  </View>
);

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
  leagueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  leagueName: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  statusContainer: {
    marginLeft: Spacing.md,
  },
  time: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  liveScore: {
    color: Colors.accentPrimary,
  },
  scoreSeparator: {
    fontSize: 18,
    color: Colors.textTertiary,
  },
  elapsed: {
    fontSize: 11,
    color: Colors.accentPrimary,
    fontWeight: '600',
    marginTop: 4,
  },
  vs: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.lg,
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  predictionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  predictionText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  lockedPrediction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unlockText: {
    fontSize: 12,
    color: Colors.accentGold,
    fontWeight: '500',
  },
});

const pillStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  label: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});

export default MatchCard;
