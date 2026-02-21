import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTipsStore } from '../../src/stores/tipsStore';
import { useCreditsStore } from '../../src/stores/creditsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { TipCard } from '../../src/components/tip/TipCard';
import { MatchCard } from '../../src/components/match/MatchCard';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { ErrorState } from '../../src/components/common/ErrorState';
import { TipCardShimmer } from '../../src/components/common/Shimmer';
import { Colors, Spacing, BorderRadius, Gradients } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function FeedScreen() {
  const router = useRouter();

  const {
    tipOfTheDay,
    matchDuJour,
    strongPicks,
    moderatePicks,
    stats,
    isLoading,
    isRefreshing,
    error,
    loadTips,
    refreshTips,
    unlockTip,
  } = useTipsStore();

  const { balance, loadBalance } = useCreditsStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadTips();
    if (isAuthenticated) {
      loadBalance();
    }
  }, [isAuthenticated]);

  const handleRefresh = useCallback(() => {
    refreshTips();
  }, []);

  const handleUnlockTip = async (tipId: string) => {
    try {
      await unlockTip(tipId);
      loadBalance();
    } catch (error) {
      console.error('Failed to unlock tip:', error);
    }
  };

  if (isLoading && !tipOfTheDay && strongPicks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header balance={balance?.total} onCreditsPress={() => router.push('/credits')} />
        <View style={styles.loadingContainer}>
          <TipCardShimmer />
          <TipCardShimmer />
          <TipCardShimmer />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !tipOfTheDay && strongPicks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header balance={balance?.total} onCreditsPress={() => router.push('/credits')} />
        <ErrorState message={error} onRetry={loadTips} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header balance={balance?.total} onCreditsPress={() => router.push('/credits')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accentPrimary}
          />
        }
      >
        {user && (
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome back, <Text style={styles.userName}>{user.displayName?.split(' ')[0] || 'Bettor'}</Text>
            </Text>
            <Text style={styles.subtitle}>Today's best picks await you</Text>
          </View>
        )}

        {stats && <StatsCard stats={stats} />}

        {tipOfTheDay && (
          <View style={styles.section}>
            <SectionHeader title="Tip of the Day" icon="star" />
            <TipCard
              tip={tipOfTheDay}
              variant="featured"
              onUnlock={() => handleUnlockTip(tipOfTheDay.id)}
            />
          </View>
        )}

        {matchDuJour && (
          <View style={styles.section}>
            <SectionHeader title="Match du Jour" icon="football" subtitle="Free prediction" />
            <MatchCard match={matchDuJour.match as any} />
          </View>
        )}

        {strongPicks.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Strong Picks" icon="trending-up" count={strongPicks.length} />
            {strongPicks.slice(0, 3).map((tip) => (
              <View key={tip.id} style={styles.tipItem}>
                <TipCard tip={tip} onUnlock={() => handleUnlockTip(tip.id)} />
              </View>
            ))}
          </View>
        )}

        {moderatePicks.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Moderate Picks" icon="analytics" count={moderatePicks.length} />
            {moderatePicks.slice(0, 3).map((tip) => (
              <View key={tip.id} style={styles.tipItem}>
                <TipCard tip={tip} onUnlock={() => handleUnlockTip(tip.id)} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const Header: React.FC<{ balance?: number; onCreditsPress: () => void }> = ({ balance, onCreditsPress }) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.logo}>Betly</Text>
        <Badge text="BETA" variant="gradient" size="sm" gradientColors={Gradients.vip} />
      </View>
      <View style={styles.headerRight}>
        <Pressable style={styles.creditsButton} onPress={onCreditsPress}>
          <LinearGradient colors={Gradients.premium} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.creditsGradient}>
            <Ionicons name="diamond" size={14} color={Colors.backgroundPrimary} />
            <Text style={styles.creditsText}>{balance ?? 0}</Text>
          </LinearGradient>
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => router.push('/search')}>
          <Ionicons name="search" size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
};

const SectionHeader: React.FC<{ title: string; icon: keyof typeof Ionicons.glyphMap; subtitle?: string; count?: number }> = ({ title, icon, subtitle, count }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={20} color={Colors.accentPrimary} />
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && <Badge text={count.toString()} variant="default" size="sm" />}
    </View>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
  </View>
);

const StatsCard: React.FC<{ stats: any }> = ({ stats }) => (
  <Card variant="gradient" gradientColors={['#1a1a2e', '#16213e']} padding="md">
    <View style={styles.statsContainer}>
      <StatItem label="Win Rate" value={`${(stats.winRate * 100).toFixed(0)}%`} color={Colors.accentPrimary} />
      <View style={styles.statsDivider} />
      <StatItem label="Avg Odds" value={stats.avgOdds.toFixed(2)} />
      <View style={styles.statsDivider} />
      <StatItem label="ROI" value={`${stats.profit > 0 ? '+' : ''}${(stats.profit * 100).toFixed(0)}%`} color={stats.profit > 0 ? Colors.accentPrimary : Colors.error} />
    </View>
  </Card>
);

const StatItem: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, color && { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  loadingContainer: { flex: 1, padding: Spacing.xl, gap: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logo: { fontSize: 24, fontWeight: '800', color: Colors.accentPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  creditsButton: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  creditsGradient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  creditsText: { fontSize: 14, fontWeight: '700', color: Colors.backgroundPrimary },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  welcomeSection: { marginBottom: Spacing['2xl'] },
  welcomeText: { fontSize: 20, color: Colors.textSecondary },
  userName: { color: Colors.textPrimary, fontWeight: '700' },
  subtitle: { fontSize: 14, color: Colors.textTertiary, marginTop: Spacing.sm },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statsDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  statItem: { alignItems: 'center', gap: Spacing.sm },
  statLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  section: { marginTop: Spacing['2xl'] },
  sectionHeader: { marginBottom: Spacing.lg },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  sectionSubtitle: { fontSize: 13, color: Colors.textTertiary, marginTop: Spacing.sm, marginLeft: 28 },
  tipItem: { marginBottom: Spacing.lg },
  bottomPadding: { height: 100 },
});
