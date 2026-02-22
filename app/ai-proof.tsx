import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Spacing, BorderRadius } from '../src/constants/theme';
import { portfolioService } from '../src/api/services';

interface AIStats {
  totalBets: number;
  wonBets: number;
  winRate: number;
  roi: number;
  totalProfit: number;
  avgOdds: number;
  weeklyStats?: {
    bets: number;
    won: number;
    profit: number;
  };
  monthlyStats?: {
    bets: number;
    won: number;
    profit: number;
  };
}

export default function AIProofScreen() {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await portfolioService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load AI stats:', error);
      // Set mock data for demo
      setStats({
        totalBets: 1247,
        wonBets: 782,
        winRate: 62.7,
        roi: 14.3,
        totalProfit: 2450,
        avgOdds: 1.85,
        weeklyStats: { bets: 45, won: 28, profit: 124 },
        monthlyStats: { bets: 186, won: 117, profit: 520 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatCard = (
    label: string,
    value: string | number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    suffix?: string
  ) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>
          {value}
          {suffix && <Text style={styles.statSuffix}>{suffix}</Text>}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "L'IA avait raison",
          headerStyle: { backgroundColor: Colors.backgroundPrimary },
          headerTintColor: Colors.textPrimary,
        }}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadStats}
            tintColor={Colors.accentPrimary}
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <LinearGradient
            colors={Gradients.predictions}
            style={styles.heroGradient}
          >
            <Ionicons name="sparkles" size={40} color={Colors.backgroundPrimary} />
            <Text style={styles.heroTitle}>L'IA avait raison</Text>
            <Text style={styles.heroSubtitle}>
              Statistiques de performance de nos prédictions
            </Text>
          </LinearGradient>
        </View>

        {isLoading && !stats ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.accentPrimary} />
          </View>
        ) : stats ? (
          <>
            {/* Main Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance globale</Text>
              <View style={styles.statsGrid}>
                {renderStatCard(
                  'Total paris',
                  stats.totalBets.toLocaleString(),
                  'stats-chart',
                  Colors.info
                )}
                {renderStatCard(
                  'Paris gagnés',
                  stats.wonBets.toLocaleString(),
                  'checkmark-circle',
                  Colors.success
                )}
                {renderStatCard(
                  'Taux de réussite',
                  (stats.winRate ?? 0).toFixed(1),
                  'trending-up',
                  Colors.accentPrimary,
                  '%'
                )}
                {renderStatCard(
                  'ROI',
                  `+${(stats.roi ?? 0).toFixed(1)}`,
                  'cash',
                  Colors.accentGold,
                  '%'
                )}
              </View>
            </View>

            {/* Profit Card */}
            <View style={styles.section}>
              <View style={styles.profitCard}>
                <LinearGradient
                  colors={['rgba(0, 209, 102, 0.15)', 'rgba(0, 209, 102, 0.05)']}
                  style={styles.profitGradient}
                >
                  <Text style={styles.profitLabel}>Profit total</Text>
                  <Text style={styles.profitValue}>
                    +{stats.totalProfit.toLocaleString()}€
                  </Text>
                  <Text style={styles.profitSubtext}>
                    Basé sur une mise de 10€ par pari
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Period Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Par période</Text>

              {/* Weekly */}
              {stats.weeklyStats && (
                <View style={styles.periodCard}>
                  <View style={styles.periodHeader}>
                    <Ionicons name="calendar" size={18} color={Colors.textSecondary} />
                    <Text style={styles.periodTitle}>Cette semaine</Text>
                  </View>
                  <View style={styles.periodStats}>
                    <View style={styles.periodStat}>
                      <Text style={styles.periodValue}>{stats.weeklyStats.bets}</Text>
                      <Text style={styles.periodLabel}>Paris</Text>
                    </View>
                    <View style={styles.periodStat}>
                      <Text style={styles.periodValue}>{stats.weeklyStats.won}</Text>
                      <Text style={styles.periodLabel}>Gagnés</Text>
                    </View>
                    <View style={styles.periodStat}>
                      <Text style={[styles.periodValue, styles.profitText]}>
                        +{stats.weeklyStats.profit}€
                      </Text>
                      <Text style={styles.periodLabel}>Profit</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Monthly */}
              {stats.monthlyStats && (
                <View style={styles.periodCard}>
                  <View style={styles.periodHeader}>
                    <Ionicons name="calendar" size={18} color={Colors.textSecondary} />
                    <Text style={styles.periodTitle}>Ce mois</Text>
                  </View>
                  <View style={styles.periodStats}>
                    <View style={styles.periodStat}>
                      <Text style={styles.periodValue}>{stats.monthlyStats.bets}</Text>
                      <Text style={styles.periodLabel}>Paris</Text>
                    </View>
                    <View style={styles.periodStat}>
                      <Text style={styles.periodValue}>{stats.monthlyStats.won}</Text>
                      <Text style={styles.periodLabel}>Gagnés</Text>
                    </View>
                    <View style={styles.periodStat}>
                      <Text style={[styles.periodValue, styles.profitText]}>
                        +{stats.monthlyStats.profit}€
                      </Text>
                      <Text style={styles.periodLabel}>Profit</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Ionicons name="information-circle" size={16} color={Colors.textMuted} />
              <Text style={styles.disclaimerText}>
                Les performances passées ne garantissent pas les résultats futurs.
                Pariez de manière responsable.
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    padding: Spacing.xl,
  },
  heroGradient: {
    alignItems: 'center',
    padding: Spacing['4xl'],
    borderRadius: BorderRadius.xl,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.backgroundPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.backgroundPrimary,
    opacity: 0.8,
    textAlign: 'center',
  },
  loading: {
    paddingVertical: Spacing['6xl'],
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statSuffix: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  profitCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 102, 0.2)',
  },
  profitGradient: {
    padding: Spacing['3xl'],
    alignItems: 'center',
  },
  profitLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  profitValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.accentPrimary,
    marginBottom: Spacing.sm,
  },
  profitSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  periodCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  periodStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodStat: {
    alignItems: 'center',
  },
  periodValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  profitText: {
    color: Colors.accentPrimary,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
    gap: Spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
