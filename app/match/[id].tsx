import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useMatchesStore, isMatchLive, isMatchFinished, getStatusDisplay } from '../../src/stores/matchesStore';
import { useCreditsStore } from '../../src/stores/creditsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { Card } from '../../src/components/common/Card';
import { Badge, LiveBadge, ConfidenceBadge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { TeamLogo } from '../../src/components/common/TeamLogo';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { ErrorState } from '../../src/components/common/ErrorState';
import { Colors, Spacing, BorderRadius, Gradients } from '../../src/constants/theme';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const matchId = parseInt(id || '0', 10);

  const { selectedMatch, isLoadingMatch, error, loadMatchDetails, unlockPrediction, clearSelectedMatch } = useMatchesStore();
  const { balance, loadBalance, spend } = useCreditsStore();
  const { isAuthenticated, isVip } = useAuthStore();
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    if (matchId) loadMatchDetails(matchId);
    return () => clearSelectedMatch();
  }, [matchId]);

  const handleUnlock = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    try {
      setIsUnlocking(true);
      await unlockPrediction(matchId);
      loadBalance();
    } catch (error: any) {
      if (error.code === 'INSUFFICIENT_CREDITS') {
        Alert.alert('Insufficient Credits', 'You need more credits to unlock this prediction.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Credits', onPress: () => router.push('/credits') },
        ]);
      } else {
        Alert.alert('Error', error.message || 'Failed to unlock prediction');
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isLoadingMatch) return <LoadingSpinner fullScreen message="Loading match..." />;
  if (error) return <ErrorState message={error} onRetry={() => loadMatchDetails(matchId)} />;
  if (!selectedMatch) return <ErrorState message="Match not found" />;

  const match = selectedMatch;
  const isLive = isMatchLive(match.status);
  const isFinished = isMatchFinished(match.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Match Details</Text>
        <Pressable style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match Header */}
        <Card variant="gradient" gradientColors={['#1a1a2e', '#16213e']} padding="lg">
          <View style={styles.matchHeader}>
            <View style={styles.leagueRow}>
              {match.league.logo && <TeamLogo uri={match.league.logo} size="sm" />}
              <Text style={styles.leagueName}>{match.league.name}</Text>
            </View>
            {isLive && <LiveBadge />}
          </View>

          <View style={styles.teamsRow}>
            <View style={styles.teamColumn}>
              <TeamLogo uri={match.homeTeam.logo} size="xl" />
              <Text style={styles.teamName}>{match.homeTeam.name}</Text>
            </View>

            <View style={styles.scoreColumn}>
              {isLive || isFinished ? (
                <>
                  <View style={styles.scoreBox}>
                    <Text style={[styles.score, isLive && styles.liveScore]}>{match.homeScore ?? 0}</Text>
                    <Text style={styles.scoreSeparator}>-</Text>
                    <Text style={[styles.score, isLive && styles.liveScore]}>{match.awayScore ?? 0}</Text>
                  </View>
                  <Text style={styles.status}>{getStatusDisplay(match.status, match.elapsed)}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.matchTime}>{format(new Date(match.date), 'HH:mm')}</Text>
                  <Text style={styles.matchDate}>{format(new Date(match.date), 'EEEE, MMM d')}</Text>
                </>
              )}
            </View>

            <View style={styles.teamColumn}>
              <TeamLogo uri={match.awayTeam.logo} size="xl" />
              <Text style={styles.teamName}>{match.awayTeam.name}</Text>
            </View>
          </View>
        </Card>

        {/* AI Prediction Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={Gradients.aiSubtle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.aiIcon}>
              <Ionicons name="sparkles" size={16} color={Colors.backgroundPrimary} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>AI Prediction</Text>
          </View>

          {match.isUnlocked && match.prediction ? (
            <Card variant="default" padding="lg">
              <View style={styles.predictionHeader}>
                <ConfidenceBadge confidence={match.prediction.confidence} />
                <Text style={styles.predictionLabel}>Prediction</Text>
              </View>
              <Text style={styles.predictionText}>{match.prediction.prediction}</Text>
              {match.prediction.reasoning && (
                <Text style={styles.predictionReasoning}>{match.prediction.reasoning}</Text>
              )}
              {match.prediction.aiAnalysis && (
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisTitle}>AI Analysis</Text>
                  <Text style={styles.analysisText}>{match.prediction.aiAnalysis}</Text>
                </View>
              )}
            </Card>
          ) : (
            <Card variant="outlined" padding="lg">
              <View style={styles.lockedContent}>
                <LinearGradient colors={Gradients.premium} style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={24} color={Colors.backgroundPrimary} />
                </LinearGradient>
                <Text style={styles.lockedTitle}>AI Prediction Locked</Text>
                <Text style={styles.lockedSubtitle}>Unlock to see our AI analysis and prediction</Text>
                <Button
                  title="Unlock Prediction"
                  onPress={handleUnlock}
                  variant="gradient"
                  size="lg"
                  fullWidth
                  loading={isUnlocking}
                  gradientColors={Gradients.premium}
                  icon={<Ionicons name="diamond" size={18} color={Colors.backgroundPrimary} />}
                  style={styles.unlockButton}
                />
                <Text style={styles.creditsCost}>5 credits</Text>
              </View>
            </Card>
          )}
        </View>

        {/* AI Chat Button (VIP/Expert only) */}
        {isVip() && (
          <Button
            title="Chat with AI Expert"
            onPress={() => router.push(`/ai-chat/${matchId}`)}
            variant="gradient"
            size="lg"
            fullWidth
            gradientColors={Gradients.vip}
            icon={<Ionicons name="chatbubbles" size={20} color={Colors.backgroundPrimary} />}
            style={styles.aiChatButton}
          />
        )}

        {/* Match Statistics */}
        {match.statistics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match Statistics</Text>
            <Card variant="default" padding="lg">
              <StatRow label="Possession" home={match.statistics.home.possession} away={match.statistics.away.possession} suffix="%" />
              <StatRow label="Shots" home={match.statistics.home.shots} away={match.statistics.away.shots} />
              <StatRow label="On Target" home={match.statistics.home.shotsOnTarget} away={match.statistics.away.shotsOnTarget} />
              <StatRow label="Corners" home={match.statistics.home.corners} away={match.statistics.away.corners} />
              <StatRow label="Fouls" home={match.statistics.home.fouls} away={match.statistics.away.fouls} />
            </Card>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const StatRow: React.FC<{ label: string; home?: number; away?: number; suffix?: string }> = ({ label, home, away, suffix = '' }) => {
  const total = (home || 0) + (away || 0);
  const homePercent = total > 0 ? ((home || 0) / total) * 100 : 50;

  return (
    <View style={statStyles.row}>
      <Text style={statStyles.value}>{home ?? 0}{suffix}</Text>
      <View style={statStyles.center}>
        <Text style={statStyles.label}>{label}</Text>
        <View style={statStyles.barContainer}>
          <View style={[statStyles.barHome, { width: `${homePercent}%` }]} />
          <View style={[statStyles.barAway, { width: `${100 - homePercent}%` }]} />
        </View>
      </View>
      <Text style={statStyles.value}>{away ?? 0}{suffix}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  shareButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  content: { padding: Spacing.xl },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  leagueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  leagueName: { fontSize: 13, color: Colors.textSecondary },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamColumn: { flex: 1, alignItems: 'center', gap: Spacing.md },
  teamName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  scoreColumn: { alignItems: 'center', paddingHorizontal: Spacing.xl },
  scoreBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  score: { fontSize: 36, fontWeight: '800', color: Colors.textPrimary },
  liveScore: { color: Colors.accentPrimary },
  scoreSeparator: { fontSize: 24, color: Colors.textTertiary },
  status: { fontSize: 12, color: Colors.textSecondary, marginTop: Spacing.sm },
  matchTime: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  matchDate: { fontSize: 13, color: Colors.textSecondary, marginTop: Spacing.sm },
  section: { marginTop: Spacing['2xl'] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  aiIcon: { width: 28, height: 28, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  predictionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  predictionLabel: { fontSize: 13, color: Colors.textSecondary },
  predictionText: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.lg },
  predictionReasoning: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  analysisSection: { marginTop: Spacing.xl, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  analysisTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.md },
  analysisText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  lockedContent: { alignItems: 'center', paddingVertical: Spacing.xl },
  lockIcon: { width: 56, height: 56, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  lockedTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  lockedSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  unlockButton: { marginTop: Spacing.lg },
  creditsCost: { fontSize: 13, color: Colors.textTertiary, marginTop: Spacing.md },
  aiChatButton: { marginTop: Spacing['2xl'] },
  bottomPadding: { height: 40 },
});

const statStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  value: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, width: 50, textAlign: 'center' },
  center: { flex: 1, marginHorizontal: Spacing.lg },
  label: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },
  barContainer: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden' },
  barHome: { backgroundColor: Colors.accentPrimary },
  barAway: { backgroundColor: Colors.info },
});
